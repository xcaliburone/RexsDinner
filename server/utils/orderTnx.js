const mysql = require('mysql');
const connection = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'rex dinner' });

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
        // const orderDetailsId = await generateOrderDetailsId();
        const orderDetailsQuery = 'INSERT INTO order_details (order_id, menu_id, quantity, price) VALUES ?';
        // const orderDetails = items.map(item => [orderDetailsId, orderId, item.menu_id, item.quantity, item.price * item.quantity]);
        const orderDetails = items.map(item => [orderId, item.menu_id, item.quantity, item.price * item.quantity]);

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
        const updateTotalPriceQuery = 'UPDATE orders SET total_price = (SELECT SUM(price) FROM order_details WHERE order_id = ?) WHERE id = ?';
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