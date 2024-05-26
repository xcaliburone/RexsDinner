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

// const { generateOrderId, generateOrderDetailsId } = require('./utils/generateID')
const {
    startTransaction,
    commitTransaction,
    rollbackTransaction,
    createOrder,
    createOrderDetails,
    updateTotalPrice
} = require('./utils/orderTnx')

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

app.post('/create-order/:employeeId', async (req, res) => {
    const { status, items, customer_name } = req.body;
    const { employeeId } = req.params;

    const orderTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    console.log('Received data:', { status, items, customer_name, employeeId, orderTime });

    if (!customer_name || !status || !Array.isArray(items) || items.length === 0) {
        return res.status(400).send('Invalid data provided');
    }

    try {
        await startTransaction();

        const orderId = await createOrder(employeeId, orderTime, status, customer_name);

        await createOrderDetails(orderId, items);

        await updateTotalPrice(orderId);

        await commitTransaction();
        // setTimeout(async () => {
        //     try {
        //         await commitTransaction();
        //         console.log('Transaction committed after delay');

        //         res.send({ success: true, message: 'Order created successfully' });
        //     } catch (error) {
        //         console.error('Error committing transaction after delay:', error);
        //     }
        // }, 60000);

        res.send({ success: true, message: 'Order created successfully' });
    } catch (error) {
        console.error("Error creating order:", error);

        await rollbackTransaction();

        return res.status(500).send('Internal Server Error');
    }
});

app.get('/orders', (req, res) => {
    const query = `
    SELECT o.id as order_id, o.customer_name, o.status, o.order_status, o.order_time as order_time, o.total_price as total_price,
        GROUP_CONCAT(
            DISTINCT CONCAT(
                'Menu: ', m.name,
                ', Quantity: ', od.quantity,
                ', Price: ', od.price
            ) SEPARATOR ' | '
        ) as menu_items,
        GROUP_CONCAT(
            DISTINCT CONCAT(
                'Ingredient: ', i.name
            ) SEPARATOR ' | '
        ) as ingredients
    FROM orders o
    JOIN order_details od ON o.id = od.order_id
    JOIN menus m ON m.id = od.menu_id
    JOIN menu_ingredients mi ON m.id = mi.menu_id
    JOIN ingredients i ON mi.ingredient_id = i.id
    GROUP BY o.id, o.customer_name, o.status, o.order_status, o.order_time, o.total_price
    ORDER BY o.id;
    `;
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