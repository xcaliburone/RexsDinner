const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const path = require('path')
const { format } = require('date-fns');
const bodyParser = require('body-parser');

const app = express()
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());
const port = 3032;

const corsOptions = {
    origin: 'http://localhost:5173', // Sesuaikan dengan alamat frontend
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rex dinner'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Rex`s Dinner Database');
});

const { generateOrderId, generateOrderDetailsId } = require('./utils/generateID')

app.get('/', (req, res) => {
    return res.redirect('/');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`Email: ${email}, Password: ${password}`);

    const query = 'SELECT id FROM employees WHERE email = ? AND password = ?';
    
    connection.query(query, [email, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan pada server');
        }

        if (results.length > 0) {
            const employeeId = results[0].id;
            res.send({ success: true, message: 'Login berhasil', employeeId });
        } else {
            res.send({ success: false, message: 'Akun tidak terdaftar' });
        }
    });
});

app.get('/menus', (req, res) => {
    const query = 'SELECT * FROM menus';
    connection.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

app.get('/ingredients', (req, res) => {
    const query = 'SELECT * FROM ingredients';
    connection.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

app.get('/menu-ingredients/:menu_id', (req, res) => {
    const { menu_id } = req.params;
    const query = `
        SELECT mi.quantity, i.name
        FROM menu_ingredients mi
        JOIN ingredients i ON mi.ingredient_id = i.id
        WHERE mi.menu_id = ?
    `;
    connection.query(query, [menu_id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

app.post('/create-order/:employeeId', (req, res) => {
    const { status, items, customer_name } = req.body;
    const { employeeId } = req.params;
    const orderTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    console.log('Received data:', { status, items, customer_name, employeeId, orderTime });

    if (!customer_name || !status || !Array.isArray(items) || items.length === 0) {
        return res.status(400).send('Invalid data provided');
    }

    const orderStatus = 'processing';

    try {
        createOrder(employeeId, orderTime, status, orderStatus, items, customer_name, res);
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).send('Internal Server Error');
    }
});

const createOrder = async (employeeId, orderTime, status, orderStatus, items, customer_name, res) => {
    try {
        const orderId = await generateOrderId();
        const orderDetailsId = await generateOrderDetailsId();

        console.log("order id :", orderId);
        console.log("order details id :", orderDetailsId);

        connection.beginTransaction(async (err) => {
            if (err) {
                console.error('Error starting transaction:', err);
                return res.status(500).send('Internal Server Error');
            }

            const queryOrder = 'INSERT INTO orders (id, employee_id, customer_name, order_time, status, total_price) VALUES (?, ?, ?, ?, ?, 0, ?)';
            connection.query(queryOrder, [orderId, employeeId, customer_name, orderTime, status, orderStatus], async (err, result) => {
                if (err) {
                    console.error('Error inserting order:', err);
                    connection.rollback(() => res.status(500).send('Internal Server Error'));
                    return;
                }

                const orderDetailsQuery = 'INSERT INTO order_details (id, order_id, menu_id, quantity, price) VALUES ?';
                const orderDetails = items.map(item => [orderDetailsId, orderId, item.menu_id, item.quantity, item.price * item.quantity]);

                connection.query(orderDetailsQuery, [orderDetails], async (err) => {
                    if (err) {
                        console.error('Error inserting order details:', err);
                        connection.rollback(() => res.status(500).send('Internal Server Error'));
                        return;
                    }

                    const updateTotalPriceQuery = 'UPDATE orders SET total_price = (SELECT SUM(price) FROM order_details WHERE order_id = ?) WHERE id = ?';
                    connection.query(updateTotalPriceQuery, [orderId, orderId], async (err) => {
                        if (err) {
                            console.error('Error updating total price:', err);
                            connection.rollback(() => res.status(500).send('Internal Server Error'));
                            return;
                        }

                        // Delay selama 1 menit sebelum menyelesaikan transaksi
                        setTimeout(() => {
                            connection.commit(async (err) => {
                                if (err) {
                                    console.error('Error committing transaction:', err);
                                    connection.rollback(() => res.status(500).send('Internal Server Error'));
                                    return;
                                }

                                res.send({ success: true, message: 'Order created successfully' });
                            });
                        }, 60000); // 1 menit dalam milidetik
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).send('Internal Server Error');
    }
};


app.get('/orders', (req, res) => {
    const query = 'SELECT * FROM orders';
    connection.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

app.put('/complete-order/:orderId', (req, res) => {
    const { orderId } = req.params;

    const query = 'UPDATE orders SET order_status = ? WHERE id = ?';

    connection.query(query, ['completed', orderId], (err, results) => {
        if (err) {
            console.error('Error completing order:', err);
            return res.status(500).send('Internal Server Error');
        }

        res.send({ success: true, message: 'Order completed successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});