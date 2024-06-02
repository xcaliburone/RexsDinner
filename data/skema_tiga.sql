-- SKEMA 3 : Complete Order Employee 1
START TRANSACTION ;

SELECT mi.ingredient_id, i.name, SUM(mi.quantity * od.quantity) total_needed, i.stock
    FROM order_details od
    JOIN menu_ingredients mi ON od.menu_id = mi.menu_id
    JOIN ingredients i ON mi.ingredient_id = i.id
WHERE od.order_id = 'OR14'
GROUP BY mi.ingredient_id;

UPDATE ingredients SET stock = stock - 2 WHERE id = 'IG01';
UPDATE ingredients SET stock = stock - 1 WHERE id = 'IG02';
UPDATE ingredients SET stock = stock - 1 WHERE id = 'IG04';

INSERT INTO stock_transactions (employee_id, order_id, ingredient_id, quantity, type)
VALUES ('EM01', 'OR14', 'IG01', '2', 'remove'),
       ('EM01', 'OR14', 'IG02', '1', 'remove'),
       ('EM01', 'OR14', 'IG04', '1', 'remove');

UPDATE orders SET order_status = 'completed' WHERE id = 'OR14';

ROLLBACK ;

-- SKEMA 3 : Complete Order Employee 2
START TRANSACTION ;

SELECT mi.ingredient_id, i.name, SUM(mi.quantity * od.quantity) total_needed, i.stock
    FROM order_details od
    JOIN menu_ingredients mi ON od.menu_id = mi.menu_id
    JOIN ingredients i ON mi.ingredient_id = i.id
WHERE od.order_id = 'OR16'
GROUP BY mi.ingredient_id;

UPDATE ingredients SET stock = stock - 3 WHERE id = 'IG01';
UPDATE ingredients SET stock = stock - 1 WHERE id = 'IG02';
UPDATE ingredients SET stock = stock - 1 WHERE id = 'IG03';
UPDATE ingredients SET stock = stock - 1 WHERE id = 'IG04';

INSERT INTO stock_transactions (employee_id, order_id, ingredient_id, quantity, type)
VALUES ('EM02', 'OR16', 'IG01', '3', 'remove'),
       ('EM02', 'OR16', 'IG02', '1', 'remove'),
       ('EM02', 'OR16', 'IG03', '1', 'remove'),
       ('EM02', 'OR16', 'IG04', '1', 'remove');

UPDATE orders SET order_status = 'completed' WHERE id = 'OR16';

ROLLBACK ;