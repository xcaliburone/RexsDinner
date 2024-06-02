const mysql = require('mysql');
const connection = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'rexdinner' });

const { generateOrderId, generateOrderDetailsId } = require('./generateID')

const startTransaction = async () => {
    return new Promise((resolve, reject) => {
        connection.beginTransaction(err => {
            if (err) {
                console.error('Error starting transaction:', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const commitTransaction = async () => {
    return new Promise((resolve, reject) => {
        connection.commit(err => {
            if (err) {
                console.error('Error committing transaction:', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const rollbackTransaction = async () => {
    return new Promise((resolve, reject) => {
        connection.rollback(() => {
            console.log('Transaction rolled back');
            resolve();
        });
    });
};

const createOrder = async (employeeId, orderTime, status, customer_name) => {
    try {
        const orderId = await generateOrderId();
        const query = 'INSERT INTO orders (id, employee_id, customer_name, order_time, status, total_price) VALUES (?, ?, ?, ?, ?, ?)';
        const result = await new Promise((resolve, reject) => {
            connection.query(query, [orderId, employeeId, customer_name, orderTime, status, 0], (err, result) => {
                if (err) {
                    console.error('Error inserting order:', err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        return orderId;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

const createOrderDetails = async (orderId, items) => {
    try {
        // Menginisialisasi objek untuk menyimpan quantity tertinggi untuk setiap menu
        const maxQuantities = {};

        // Mendapatkan quantity tertinggi untuk setiap menu
        items.forEach(item => {
            const { menu_id, quantity } = item;
            if (!maxQuantities[menu_id] || quantity > maxQuantities[menu_id]) {
                maxQuantities[menu_id] = quantity;
            }
        });

        // Mengonversi objek maxQuantities menjadi array orderDetails yang sesuai dengan struktur yang diharapkan oleh query
        const orderDetails = Object.entries(maxQuantities).map(([menu_id, quantity]) => {
            const item = items.find(item => item.menu_id === menu_id);
            return [orderId, menu_id, quantity, item.price * quantity];
        });

        // Melakukan query INSERT INTO order_details
        const orderDetailsQuery = 'INSERT INTO order_details (order_id, menu_id, quantity, price) VALUES ?';
        const result = await new Promise((resolve, reject) => {
            connection.query(orderDetailsQuery, [orderDetails], (err, result) => {
                if (err) {
                    console.error('Error inserting order details:', err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        return;
    } catch (error) {
        console.error('Error creating order details:', error);
        throw error;
    }
};

const updateTotalPrice = async (orderId) => {
    return new Promise((resolve, reject) => {
        // const updateTotalPriceQuery = 'UPDATE orders SET total_price = (SELECT MAX(price) FROM order_details WHERE order_id = ?) WHERE id = ?';
        const updateTotalPriceQuery = `
        UPDATE orders
        SET total_price = (
            SELECT SUM(max_price) AS total_price
            FROM (
                SELECT MAX(od.quantity * m.price) AS max_price
                FROM order_details od
                JOIN menus m ON od.menu_id = m.id
                WHERE od.order_id = ?
                GROUP BY od.menu_id
            ) AS subquery
        )
        WHERE id = ?;
        `;
        connection.query(updateTotalPriceQuery, [orderId, orderId], (err, result) => {
            if (err) {
                console.error('Error updating total price:', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

module.exports = { startTransaction, commitTransaction, rollbackTransaction, createOrder, createOrderDetails, updateTotalPrice }