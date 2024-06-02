CREATE DATABASE IF NOT EXISTS `RexDinner`;
USE `RexDinner`;

CREATE TABLE IF NOT EXISTS `employees` (
    `id` VARCHAR(11) NOT NULL, -- EM01
    `name` VARCHAR(32) NOT NULL,
    `email` VARCHAR(32) NOT NULL,
    `password` VARCHAR(32) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_emp_name` (`name`)
);

CREATE TABLE IF NOT EXISTS `ingredients` (
    `id` VARCHAR(11) NOT NULL, -- IG01
    `name` VARCHAR(32) NOT NULL,
    `link` TEXT NOT NULL,
    `stock` INT(11) DEFAULT 0,
    PRIMARY KEY (`id`),
    INDEX `idx_ing_name` (`name`)
);

CREATE TABLE IF NOT EXISTS `menus` (
    `id` VARCHAR(11) NOT NULL, -- MN01
    `name` VARCHAR(32) NOT NULL,
    `link` TEXT NOT NULL,
    `type` enum('drink','food') NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_mns_name` (`name`)
);

CREATE TABLE IF NOT EXISTS `menu_ingredients` (
    `menu_id` VARCHAR(11) NOT NULL,
    `ingredient_id` VARCHAR(11) NOT NULL,
    `quantity` INT(11) NOT NULL,
    UNIQUE KEY `unique_menu_ingredient` (`menu_id`, `ingredient_id`),
    KEY `menu_id_menu_ingred` (`menu_id`),
    KEY `ingred_id_menu_ingred` (`ingredient_id`),
    CONSTRAINT `menu_id_menu_ingred` FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `ingred_id_menu_ingred` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `orders` (
    `id` VARCHAR(11) NOT NULL, -- OR01
    `employee_id` VARCHAR(11) NOT NULL,
    `customer_name` VARCHAR(32) NOT NULL,
    `order_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('take away', 'dine in') NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `order_status` ENUM('processing', 'completed') NOT NULL DEFAULT 'processing',
    INDEX `idx_orders_status`(`status`),
    INDEX `idx_orders_cust_name`(`customer_name`),
    INDEX `idx_orders_orderstatus`(`order_status`),
    PRIMARY KEY (`id`),
    KEY `emp_id_orders` (`employee_id`),
    CONSTRAINT `emp_id_orders` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `order_details` (
    `order_id` VARCHAR(11) NOT NULL,
    `menu_id` VARCHAR(11) NOT NULL,
    `quantity` INT(11) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    UNIQUE KEY `unique_menu_order_details` (`order_id`, `menu_id`),
    KEY `order_id_order_details` (`order_id`),
    KEY `menu_id_order_details` (`menu_id`),
    CONSTRAINT `order_id_order_details` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `menu_id_order_details` FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `stock_transactions` (
    `employee_id` VARCHAR(11) NOT NULL,
    `order_id` VARCHAR(11) NOT NULL,
    `ingredient_id` VARCHAR(11) NOT NULL,
    `quantity` INT(11) NOT NULL,
    `transaction_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `type` ENUM('add', 'remove') NOT NULL,
    INDEX `idx_stock_transactions_type`(`type`),
    KEY `emp_id_stock_txn` (`employee_id`),
    KEY `order_id_stock_txn` (`order_id`),
    KEY `ingred_id_stock_txn` (`ingredient_id`),
    CONSTRAINT `emp_id_stock_txn` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `order_id_stock_txn` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `ingred_id_stock_txn` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);