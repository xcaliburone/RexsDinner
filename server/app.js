const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const path = require('path')
const { format } = require('date-fns');
const bodyParser = require('body-parser');
const app = express()
const port = 3032;
const corsOptions = { origin: 'http://localhost:5173', optionsSuccessStatus: 200 };

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());
app.use(cors(corsOptions));

const connection = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'rex dinner'
}); connection.connect((err) => { if (err) throw err; console.log('Connected to MySQL Rex`s Dinner Database'); });
const { generateOrderId, generateOrderDetailsId } = require('./utils/generateID')
const { generateStockTransactionsId } = require('./utils/generateID');
const { startTransaction, commitTransaction, rollbackTransaction, createOrder, createOrderDetails, updateTotalPrice } = require('./utils/orderTnx');
const { rejects } = require('assert');

app.get('/', (req, res) => { return res.redirect('/'); });

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
                ', Stock Needed: ', (SELECT SUM(mi.quantity * od2.quantity) FROM order_details od2
                JOIN menu_ingredients mi ON od2.menu_id = mi.menu_id WHERE od2.order_id = o.id AND mi.ingredient_id = i.id)
            ) SEPARATOR ' | ') AS ingredients
        FROM orders o JOIN order_details od ON o.id = od.order_id JOIN menus m ON m.id = od.menu_id
        JOIN menu_ingredients mi ON m.id = mi.menu_id JOIN ingredients i ON mi.ingredient_id = i.id
        GROUP BY o.id, o.customer_name, o.status, o.order_status, o.order_time, o.total_price ORDER BY o.id;
    `;
    connection.query(query, (err, results) => { if (err) return res.status(500).send(err); res.send(results); });
});

app.put('/complete-order/:orderId/:employeeId', async (req, res) => {
    const { orderId, employeeId } = req.params;

    try { 
        const orderDetailsQuery = `
            SELECT m.id AS menu_id, od.quantity AS order_quantity, i.id AS ingredient_id, mi.quantity AS ingredient_quantity
            FROM orders o JOIN order_details od ON o.id = od.order_id JOIN menus m ON m.id = od.menu_id
            JOIN menu_ingredients mi ON m.id = mi.menu_id JOIN ingredients i ON mi.ingredient_id = i.id WHERE o.id = ?
        `;
        const orderDetails = await new Promise((resolve, reject) => {
            connection.query(orderDetailsQuery, [orderId], (err, results) => { if (err) reject(err); resolve(results); });
        });

        if (!orderDetails.length) { throw new Error('Invalid order details'); }

        await startTransaction(); // Mengurangi stok bahan baku yang digunakan dalam satu transaksi

        await Promise.all(orderDetails.map(async (detail) => {
            const { ingredient_id, ingredient_quantity, order_quantity } = detail;
            const totalNeeded = ingredient_quantity * order_quantity;
            const currentStockQuery = `SELECT stock FROM ingredients WHERE id = ?`
            const currentStockResult = await new Promise((resolve, reject) => {
                connection.query(currentStockQuery, [ingredient_id], (err, results) => { if(err) reject(err); resolve(results); })
            })
            const currentStock = currentStockResult[0]?.stock;
            if (currentStock === undefined) { throw new Error(`Stock for ingredient ${ingredient_id} not found`); }
        
            console.log(`Updating stock for ingredient ${ingredient_id}:`);
            console.log(`Before: ${currentStock} units`);
            console.log(`Quantity to deduct: ${totalNeeded} units`);

            const newStock = currentStock - totalNeeded; // Hitung stok setelah pengurangan
            console.log(`After: ${newStock} units`);  
            const updateStockQuery = `UPDATE ingredients SET stock = ? WHERE id = ?`;
            await new Promise((resolve, reject) => {
                connection.query(updateStockQuery, [newStock, ingredient_id], (err, results) => { if (err) reject(err); resolve(results); });
            });
        }));
        
        const transactionTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Mencatat transaksi stok dalam satu operasi batch
        const stockTransactionsValues = orderDetails.map(detail => [
            employeeId, orderId, detail.ingredient_id, detail.ingredient_quantity * detail.order_quantity, transactionTime, 'remove'
        ]);
        const stockTransaction = `INSERT INTO stock_transactions (employee_id, order_id, ingredient_id, quantity, transaction_time, type) VALUES ?`;
        await new Promise((resolve, reject) => {
            connection.query(stockTransaction, [stockTransactionsValues], (err, results) => { if (err) reject(err); resolve(results); });
        });
        const completeOrderQuery = 'UPDATE orders SET order_status = ? WHERE id = ?';
        await new Promise((resolve, reject) => {
            connection.query(completeOrderQuery, ['completed', orderId], (err, results) => { if (err) reject(err); resolve(results); });
        });
        await commitTransaction();
        res.send({ success: true, message: 'Order completed successfully' });
    } catch (error) {
        console.error('Error completing order:', error);
        await rollbackTransaction();
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => { console.log(`Server is running at http://localhost:${port}`); });