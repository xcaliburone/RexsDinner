const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const path = require('path')
const { format } = require('date-fns');

const app = express()

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());
const port = 3032;

const corsOptions = {
    origin: 'http://localhost:5173', // Sesuaikan dengan alamat frontend Anda
    optionsSuccessStatus: 200 // beberapa legacy browsers (IE11, beberapa versi Chrome / Firefox...) tidak mengikuti 204
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

function generateCustomerId() {
    return new Promise((resolve, reject) => {
        const sql = "SELECT MAX(id) AS maxId FROM customers";
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                let maxId = result[0].maxId;
                if (!maxId) {
                    maxId = 'CS001';
                } else {
                    const numericPart = parseInt(maxId.slice(2), 10) + 1;
                    maxId = 'CS' + (numericPart < 10 ? '00' : numericPart < 100 ? '0' : '') + numericPart;
                }
                resolve(maxId);
            }
        });
    });
}

// app.post('/create-order/:employeeId', async (req, res) => {
//     const { status, items } = req.body;
//     const { employeeId } = req.params;
//     const orderTime = new Date();
//     // console.table(employeeId, status, items, orderTime)
//     console.log("Data yang diterima:", req.body);
//     console.log("adalah : ", employeeId, status, items, orderTime)
//     try {
//         const customer_id = await generateCustomerId(); // Tunggu hingga customer_id dihasilkan
//         const queryOrder = 'INSERT INTO orders (customer_id, employee_id, `Order Time`, status, `Total Price`) VALUES (?, ?, ?, ?, 0)';
//         connection.beginTransaction(err => {
//             if (err) {
//                 console.error('Error beginning transaction:', err);
//                 return res.status(500).send('Internal Server Error');
//             }
//             connection.query(queryOrder, [customer_id, employeeId, orderTime, status], (err, result) => {
//                 if (err) {
//                     console.error('Error inserting order:', err);
//                     connection.rollback(() => res.status(500).send('Internal Server Error'));
//                     return;
//                 }
//                 const orderId = result.insertId;
//                 const orderDetailsQuery = 'INSERT INTO order_details (order_id, menu_id, quantity, price) VALUES ?';
//                 const orderDetails = items.map(item => [orderId, item.menu_id, item.quantity, item.price * item.quantity]);

//                 connection.query(orderDetailsQuery, [orderDetails], err => {
//                     if (err) {
//                         console.error('Error inserting order details:', err);
//                         connection.rollback(() => res.status(500).send('Internal Server Error'));
//                         return;
//                     }

//                     const updateTotalPriceQuery = 'UPDATE orders SET total_price = (SELECT SUM(price) FROM order_details WHERE order_id = ?) WHERE id = ?';
//                     connection.query(updateTotalPriceQuery, [orderId, orderId], err => {
//                         if (err) {
//                             console.error('Error updating total price:', err);
//                             connection.rollback(() => res.status(500).send('Internal Server Error'));
//                             return;
//                         }

//                         connection.commit(err => {
//                             if (err) {
//                                 console.error('Error committing transaction:', err);
//                                 connection.rollback(() => res.status(500).send('Internal Server Error'));
//                                 return;
//                             }

//                             res.send({ success: true, message: 'Order created successfully' });
//                         });
//                     });
//                 });
//             });
//         });
//     } catch (error) {
//         console.error('Error generating customer_id:', error);
//         return res.status(500).send('Internal Server Error');
//     }
// });

app.post('/create-order/:employeeId', (req, res) => {
    const { status, items, customer_id, customer_name } = req.body;
    const { employeeId } = req.params;

    const orderTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    console.log('Received data:', { status, items, customer_id, customer_name, employeeId, orderTime });

    if (!customer_name || !status || !Array.isArray(items) || items.length === 0) {
        return res.status(400).send('Invalid data provided');
    }

    try {
        // Validasi nilai customer_name
        if (!customer_name) {
            return res.status(400).send('Customer name is required');
        }

        // Periksa apakah customer sudah ada dalam tabel customers
        const queryCheckCustomer = 'SELECT * FROM customers WHERE id = ?';
        connection.query(queryCheckCustomer, [customer_id], (err, results) => {
            if (err) {
                console.error('Error checking customer:', err);
                return res.status(500).send('Internal Server Error');
            }

            if (results.length === 0) {
                // Jika customer belum ada, tambahkan customer baru ke dalam tabel customers
                const queryInsertCustomer = 'INSERT INTO customers (id, name) VALUES (?, ?)';
                connection.query(queryInsertCustomer, [customer_id, customer_name], (err) => {
                    if (err) {
                        console.error('Error inserting customer:', err);
                        return res.status(500).send('Internal Server Error');
                    }

                    // Lanjutkan dengan langkah-langkah pembuatan pesanan setelah menambahkan customer baru
                    createOrderAfterCustomerInsert(customer_id, employeeId, orderTime, status, items, res);
                });
            } else {
                // Lanjutkan dengan langkah-langkah pembuatan pesanan jika customer sudah ada
                createOrderAfterCustomerInsert(customer_id, employeeId, orderTime, status, items, res);
            }
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).send('Internal Server Error');
    }
});

// Fungsi untuk membuat pesanan setelah customer ditambahkan ke dalam tabel customers
const createOrderAfterCustomerInsert = (customer_id, employeeId, orderTime, status, items, res) => {
    connection.beginTransaction(err => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).send('Internal Server Error');
        }

        const queryOrder = 'INSERT INTO orders (customer_id, employee_id, order_time, status, total_price) VALUES (?, ?, ?, ?, 0)';
        connection.query(queryOrder, [customer_id, employeeId, orderTime, status], (err, result) => {
            if (err) {
                console.error('Error inserting order:', err);
                connection.rollback(() => res.status(500).send('Internal Server Error'));
                return;
            }

            const orderId = result.insertId;
            const orderDetailsQuery = 'INSERT INTO order_details (order_id, menu_id, quantity, price) VALUES ?';
            const orderDetails = items.map(item => [orderId, item.menu_id, item.quantity, item.price * item.quantity]);

            connection.query(orderDetailsQuery, [orderDetails], err => {
                if (err) {
                    console.error('Error inserting order details:', err);
                    connection.rollback(() => res.status(500).send('Internal Server Error'));
                    return;
                }

                const updateTotalPriceQuery = 'UPDATE orders SET total_price = (SELECT SUM(price) FROM order_details WHERE order_id = ?) WHERE id = ?';
                connection.query(updateTotalPriceQuery, [orderId, orderId], err => {
                    if (err) {
                        console.error('Error updating total price:', err);
                        connection.rollback(() => res.status(500).send('Internal Server Error'));
                        return;
                    }

                    connection.commit(err => {
                        if (err) {
                            console.error('Error committing transaction:', err);
                            connection.rollback(() => res.status(500).send('Internal Server Error'));
                            return;
                        }

                        res.send({ success: true, message: 'Order created successfully' });
                    });
                });
            });
        });
    });
};

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