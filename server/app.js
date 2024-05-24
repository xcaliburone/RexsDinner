const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const path = require('path')

const app = express()

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());
const port = 3032;

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

app.get('/', (req, res) => {
    return res.redirect('/');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`Email: ${email}, Password: ${password}`)

    const query = 'SELECT * FROM employees WHERE email = ? AND password = ?';
    
    connection.query(query, [email, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan pada server');
        }

        if (results.length > 0) {
            res.send({ success: true, message: 'Login berhasil' });
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

app.post('/create-order', (req, res) => {
    const { customer_id, employee_id, status, items } = req.body;
    const orderTime = new Date();
    const queryOrder = 'INSERT INTO orders (customer_id, employee_id, order_time, status, total_price) VALUES (?, ?, ?, ?, 0)';
    
    connection.beginTransaction(err => {
        if (err) return res.status(500).send(err);

        connection.query(queryOrder, [customer_id, employee_id, orderTime, status], (err, result) => {
            if (err) {
                connection.rollback(() => res.status(500).send(err));
                return;
            }

            const orderId = result.insertId;
            const orderDetailsQuery = 'INSERT INTO order_details (order_id, menu_id, quantity, price) VALUES ?';
            const orderDetails = items.map(item => [orderId, item.menu_id, item.quantity, item.price * item.quantity]);
            
            connection.query(orderDetailsQuery, [orderDetails], err => {
                if (err) {
                    connection.rollback(() => res.status(500).send(err));
                    return;
                }

                const updateTotalPriceQuery = 'UPDATE orders SET total_price = (SELECT SUM(price) FROM order_details WHERE order_id = ?) WHERE id = ?';
                connection.query(updateTotalPriceQuery, [orderId, orderId], err => {
                    if (err) {
                        connection.rollback(() => res.status(500).send(err));
                        return;
                    }

                    connection.commit(err => {
                        if (err) {
                            connection.rollback(() => res.status(500).send(err));
                            return;
                        }

                        res.send({ success: true, message: 'Order created successfully' });
                    });
                });
            });
        });
    });
});

app.get('/orders', (req, res) => {
    const query = 'SELECT * FROM orders WHERE status IN ("pending", "in-progress")';
    connection.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

app.post('/complete-order', (req, res) => {
    const { orderId } = req.body;
    const query = 'UPDATE orders SET status = "completed" WHERE id = ?';
    
    connection.query(query, [orderId], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ success: true, message: 'Order completed successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});