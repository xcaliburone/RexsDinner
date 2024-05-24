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
    database: 'rexdinner'
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

app.post('/createOrder', (req, res) => {
    const { customer_id, employee_id, status, total_price, order_details } = req.body;
    
    connection.beginTransaction((err) => {
        if (err) throw err;

        const orderQuery = 'INSERT INTO orders (customer_id, employee_id, `Order Time`, status, `Total Price`) VALUES (?, ?, NOW(), ?, ?)';
        connection.query(orderQuery, [customer_id, employee_id, status, total_price], (err, result) => {
            if (err) {
                return connection.rollback(() => {
                    throw err;
                });
            }

            const orderId = result.insertId;
            const orderDetailsQuery = 'INSERT INTO order_details (order_id, menu_id, quantity, price) VALUES ?';
            const orderDetailsValues = order_details.map(detail => [orderId, detail.menu_id, detail.quantity, detail.price]);

            connection.query(orderDetailsQuery, [orderDetailsValues], (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        throw err;
                    });
                }

                connection.commit((err) => {
                    if (err) {
                        return connection.rollback(() => {
                            throw err;
                        });
                    }

                    res.send({ success: true, message: 'Order created successfully' });
                });
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});