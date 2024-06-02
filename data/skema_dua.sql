-- SKEMA 2 : Penambahan Stock Ingredients Employee 1
START TRANSACTION ;

SELECT id, name, stock FROM ingredients LIMIT 0, 15 FOR UPDATE ;
SELECT id, name, stock FROM ingredients LIMIT 15, 15 FOR UPDATE ;

UPDATE ingredients SET stock = stock + 10 WHERE id = 'IG01';

SELECT stock FROM ingredients WHERE id = 'IG01';

COMMIT; ROLLBACK ;

-- SKEMA 2 : Pengurangan Stock Ingredients Employee 2
START TRANSACTION ;

SELECT id, name, stock FROM ingredients LIMIT 0, 15 FOR UPDATE ;
SELECT id, name, stock FROM ingredients LIMIT 15, 15 FOR UPDATE ;

UPDATE ingredients SET stock = stock - 10 WHERE id = 'IG01';

SELECT stock FROM ingredients WHERE id = 'IG01';

COMMIT; ROLLBACK ;