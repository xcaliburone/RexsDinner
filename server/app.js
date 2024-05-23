const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const path = require('path')

const app = express()

app.use(express.static(__dirname + 'public'));
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

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});