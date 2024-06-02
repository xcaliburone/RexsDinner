-- SKEMA 1 : Pembuatan Pesanan Employee 1
START TRANSACTION ;

SELECT MAX(id) FROM orders FOR UPDATE ;

INSERT INTO orders (id, employee_id, customer_name, status, total_price) VALUES ('', 'EM01', 'ucok', 'dine in', '');

SELECT * FROM orders ORDER BY 1 DESC LIMIT 1;

INSERT INTO order_details (order_id, menu_id, quantity, price) VALUES ('OR14', 'MN01', '1',
    (SELECT price FROM menus WHERE id = 'MN01') * order_details.quantity);

SELECT * FROM order_details ORDER BY 1 DESC LIMIT 1;

UPDATE orders SET total_price = ( SELECT SUM(max_price) total_price FROM (
    SELECT MAX(od.quantity * m.price) max_price FROM order_details od
    JOIN menus m ON od.menu_id = m.id
    WHERE od.order_id = 'OR14' GROUP BY od.menu_id
) subquery ) WHERE id = 'OR14';

SELECT * FROM orders ORDER BY 1 DESC LIMIT 1;
DELETE FROM orders ORDER BY 1 DESC LIMIT 1;
COMMIT; ROLLBACK ;

-- SKEMA 1 : Pembuatan Pesanan Employee 2
START TRANSACTION ;

SELECT MAX(id) FROM orders FOR UPDATE ;

INSERT INTO orders (id, employee_id, customer_name, status, total_price)
VALUES ('', 'EM01', 'asep', 'dine in', '');

SELECT * FROM orders ORDER BY 1 DESC LIMIT 1;

INSERT INTO order_details (order_id, menu_id, quantity, price) VALUES ('OR14', 'MN02', '2',
    (SELECT price FROM menus WHERE id = 'MN02') * order_details.quantity);

SELECT * FROM order_details ORDER BY 1 DESC LIMIT 1;

UPDATE orders SET total_price = ( SELECT SUM(max_price) total_price FROM (
        SELECT MAX(od.quantity * m.price) max_price FROM order_details od
        JOIN menus m ON od.menu_id = m.id
        WHERE od.order_id = 'OR15' GROUP BY od.menu_id
) subquery ) WHERE id = 'OR15';

SELECT * FROM orders ORDER BY 1 DESC LIMIT 1;
DELETE FROM orders ORDER BY 1 DESC LIMIT 1;
COMMIT; ROLLBACK ;