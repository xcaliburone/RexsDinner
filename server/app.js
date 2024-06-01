const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const { format } = require('date-fns');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
});
const port = 3032;
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


app.use(express.json());
app.use(cors());

const connection = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'rex dinner' });

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Rex`s Dinner Database');
});

const { generateOrderId, generateOrderDetailsId } = require('./utils/generateID');
const { generateStockTransactionsId } = require('./utils/generateID');
const { startTransaction, commitTransaction, rollbackTransaction, createOrder, createOrderDetails, updateTotalPrice } = require('./utils/orderTnx');

app.get('/', (req, res) => {
    return res.redirect('/');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`Email: ${email}, Password: ${password}`);
    const query = 'SELECT id FROM employees WHERE email = ? AND password = ?'; 
    connection.query(query, [email, password], (err, results) => {
        if (err) { console.error(err); return res.status(500).send('Terjadi kesalahan pada server'); }
        if (results.length > 0) { const employeeId = results[0].id; res.send({ success: true, message: 'Login berhasil', employeeId });
        } else { res.send({ success: false, message: 'Akun tidak terdaftar' }); }
    });
});

app.get('/menus', (req, res) => {
    const query = 'SELECT * FROM menus';
    connection.query(query, (err, results) => { if (err) return res.status(500).send(err); res.send(results); });
});

app.get('/ingredients', (req, res) => {
    const query = 'SELECT * FROM ingredients';
    connection.query(query, (err, results) => { if (err) return res.status(500).send(err); res.send(results); });
});

app.put('/ingredients/:id', (req, res) => {
    const ingredientId = req.params.id;
    const additionalStock = req.body.stock;
    connection.beginTransaction(err => {
        if (err) { return res.status(500).send(err); }

        connection.query('SELECT stock FROM ingredients WHERE id = ?', [ingredientId], (err, results) => {
            if (err) { return connection.rollback(() => { res.status(500).send(err); }); }
            const currentStock = results[0].stock;
            const newStock = currentStock + additionalStock;
            console.log(`Current stock for ingredient ${ingredientId}: ${currentStock}`);
            console.log(`Additional stock to add: ${additionalStock}`);
            connection.query('UPDATE ingredients SET stock = ? WHERE id = ?', [newStock, ingredientId], (err, results) => {
                if (err) { return connection.rollback(() => { res.status(500).send(err); }); }

                console.log(`New stock for ingredient ${ingredientId}: ${newStock}`);
                console.log(`======================================`);

                connection.commit(err => {
                    if (err) { return connection.rollback(() => { res.status(500).send(err); }); }
                    res.send({ success: true, newStock });
                    io.emit('stockUpdated', { ingredientId, newStock });
                });
            });
        });
    });
});

app.get('/menu-ingredients/:menu_id', (req, res) => {
    const { menu_id } = req.params;
    const query = `SELECT mi.quantity, i.name FROM menu_ingredients mi JOIN ingredients i ON mi.ingredient_id = i.id WHERE mi.menu_id = ?`;
    connection.query(query, [menu_id], (err, results) => { if (err) return res.status(500).send(err); res.send(results); });
});

app.post('/create-order/:employeeId', async (req, res) => {
    const { status, items, customer_name } = req.body;
    const { employeeId } = req.params;
    const orderTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    console.log('Received data:', { status, items, customer_name, employeeId, orderTime });
    if (!customer_name || !status || !Array.isArray(items) || items.length === 0) { return res.status(400).send('Invalid data provided'); }
    try {
        await startTransaction();
        const orderId = await createOrder(employeeId, orderTime, status, customer_name);
        await createOrderDetails(orderId, items);
        await updateTotalPrice(orderId);
        await commitTransaction();
        res.send({ success: true, message: 'Order created successfully' });
        io.emit('orderCreated', { orderId, customer_name, status, items });
    } catch (error) {
        console.error("Error creating order:", error);
        await rollbackTransaction();
        return res.status(500).send('Internal Server Error');
    }
});

app.get('/orders', (req, res) => {
    const query = `
        SELECT o.id AS order_id, o.customer_name, o.status, o.order_status, o.order_time, o.total_price,
            GROUP_CONCAT( DISTINCT CONCAT(
                'Menu: ', m.name,
                ', Quantity: ', (SELECT MAX(od1.quantity) FROM order_details od1 WHERE od1.order_id = o.id AND od1.menu_id = m.id),
                ', Price: ', (SELECT MAX(od1.price) FROM order_details od1 WHERE od1.order_id = o.id AND od1.menu_id = m.id)
            ) SEPARATOR ' | ') AS menu_items,
            GROUP_CONCAT( DISTINCT CONCAT(
                'Ingredient: ', i.name,
                ', Stock Needed: ', (SELECT SUM(mi.quantity * od2.quantity) FROM order_details od2 JOIN menu_ingredients mi ON od2.menu_id = mi.menu_id 
                WHERE od2.order_id = o.id AND mi.ingredient_id = i.id)
            ) SEPARATOR ' | ') AS ingredients
        FROM orders o JOIN order_details od ON o.id = od.order_id JOIN menus m ON m.id = od.menu_id JOIN menu_ingredients mi ON m.id = mi.menu_id
        JOIN ingredients i ON mi.ingredient_id = i.id GROUP BY o.id, o.customer_name, o.status, o.order_status, o.order_time, o.total_price ORDER BY o.id;
    `;
    connection.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

app.put('/complete-order/:orderId/:employeeId', async (req, res) => {
    const { orderId, employeeId } = req.params;
    try {
        const orderDetailsQuery = `
            SELECT mi.ingredient_id, SUM(mi.quantity * od.quantity) AS total_needed
            FROM order_details od
            JOIN menu_ingredients mi ON od.menu_id = mi.menu_id
            WHERE od.order_id = ?
            GROUP BY mi.ingredient_id
        `;
        const orderDetails = await new Promise((resolve, reject) => {
            connection.query(orderDetailsQuery, [orderId], (err, results) => { if (err) reject(err); resolve(results); });
        });
        if (!orderDetails.length) { throw new Error('Invalid order details'); }

        await startTransaction(); // Mulai transaksi

        await Promise.all(orderDetails.map(async (detail) => {
            const { ingredient_id, total_needed } = detail;

            const currentStockQuery = `SELECT stock FROM ingredients WHERE id = ?`;
            const currentStockResult = await new Promise((resolve, reject) => {
                connection.query(currentStockQuery, [ingredient_id], (err, results) => { if (err) reject(err); resolve(results); });
            });
            const currentStock = currentStockResult[0]?.stock;
            if (currentStock === undefined) { throw new Error(`Stock for ingredient ${ingredient_id} not found`); }

            console.log(`Ingredient: ${ingredient_id}`);
            console.log(`Stock Needed: ${total_needed}`);
            console.log(`Before: ${currentStock} units`);
            
            const newStock = currentStock - total_needed;

            console.log(`After: ${newStock} units`);
            console.log(`======================================`);

            const updateStockQuery = `UPDATE ingredients SET stock = ? WHERE id = ?`;
            await new Promise((resolve, reject) => {
                connection.query(updateStockQuery, [newStock, ingredient_id], (err, results) => { if (err) reject(err); resolve(results); });
            });

            // Menyimpan transaksi stok ke dalam tabel stock_transactions
            const transactionTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const stockTransactionValues = [employeeId, orderId, ingredient_id, total_needed, transactionTime, 'remove'];
            const stockTransactionQuery = `INSERT INTO stock_transactions (employee_id, order_id, ingredient_id, quantity, transaction_time, type) VALUES (?)`;
            await new Promise((resolve, reject) => {
                connection.query(stockTransactionQuery, [stockTransactionValues], (err, results) => { if (err) reject(err); resolve(results); });
            });
        }));
        
        const completeOrderQuery = 'UPDATE orders SET order_status = ? WHERE id = ?';
        await new Promise((resolve, reject) => {
            connection.query(completeOrderQuery, ['completed', orderId], (err, results) => { if (err) reject(err); resolve(results); });
        });

        await commitTransaction();
        res.send({ success: true, message: 'Order completed successfully' });

        io.emit('orderCompleted', { orderId });
    } catch (error) {
        console.error('Error completing order:', error);
        await rollbackTransaction();
        res.status(500).send('Internal Server Error');
    }
});

server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});