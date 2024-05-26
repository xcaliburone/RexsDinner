const mysql = require('mysql');
const connection = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'rex dinner' });

function generateOrderId() {
    return new Promise((resolve, reject) => {
        const sql = "SELECT MAX(id) maxId FROM orders";
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                let maxId = result[0].maxId;
                if (!maxId) { maxId = 'OR01';
                } else {
                    const numericPart = parseInt(maxId.slice(2), 10) + 1;
                    maxId = 'OR' + (numericPart < 10 ? '0' : '') + numericPart;
                }
                resolve(maxId);
            }
        });
    });
}

function generateOrderDetailsId() {
    return new Promise((resolve, reject) => {
        const sql = "SELECT MAX(id) maxId FROM order_details";
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
            } else {
                let maxId = result[0].maxId;
                if (!maxId) { maxId = 'OD01';
                } else {
                    const numericPart = parseInt(maxId.slice(2), 10) + 1;
                    maxId = 'OD' + (numericPart < 10 ? '0' : '') + numericPart;
                }
                resolve(maxId);
            }
        });
    });
}

module.exports = { generateOrderId, generateOrderDetailsId }