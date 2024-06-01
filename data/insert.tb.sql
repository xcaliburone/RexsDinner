INSERT INTO `employees` (`id`, `name`, `email`, `password`) VALUES
    ('EM01', 'adhim rahman', 'adhimrahaman@gmail.com', 'xcaliburone24'),
    ('EM02', 'Gracie Octaviani', 'gracieOctav@gmail.com', 'gracie1810'),
    ('EM04', 'Shani Indira Natio', 'shani@gmail.com', 'shani0510'),
    ('EM05', 'Azizi Shafaa Asadel', 'zee@gmail.com', 'zeeshafa123');

INSERT INTO `ingredients` (`id`, `name`, `link`, `stock`) VALUES
    ('IG01', 'Tomato', 'https://imgur.com/V5f2LF8.png', 100),
    ('IG02', 'Cheese', 'https://i.imgur.com/rqn8fSM.png', 100),
    ('IG03', 'Lettuce', 'https://i.imgur.com/zqkR2A4.png', 100),
    ('IG04', 'Beef Patty', 'https://i.imgur.com/waHfRq2.png', 100),
    ('IG05', 'Grape', 'https://i.imgur.com/g0A4Ala.png', 100),
    ('IG06', 'Boba', 'https://i.imgur.com/DC1GHmQ.png', 100),
    ('IG07', 'Matcha', 'https://i.imgur.com/PmIK82F.png', 100),
    ('IG08', 'Noodles', 'https://i.imgur.com/quTfVIV.png', 100),
    ('IG09', 'Eggs', 'https://i.imgur.com/HN26lrG.png', 100),
    ('IG10', 'Milk', 'https://i.imgur.com/K4jc5i5.png', 100),
    ('IG11', 'Ice', 'https://i.imgur.com/MpdzvuS.png', 100),
    ('IG12', 'Coffee Bean', 'https://i.imgur.com/dei2ETh.png', 100),
    ('IG13', 'Strawberry', 'https://i.imgur.com/Z6vxpbp.png', 100),
    ('IG14', 'Sugar', 'https://i.imgur.com/fStqf3a.png', 100),
    ('IG15', 'Onion', 'https://i.imgur.com/NoNdT5R.png', 100),
    ('IG16', 'Orange', 'https://i.imgur.com/mLupM6b.png', 100),
    ('IG17', 'Pasta', 'https://i.imgur.com/0UpCKWJ.png', 100),
    ('IG18', 'Mushrooms', 'https://i.imgur.com/DDu6CSM.png', 100),
    ('IG19', 'Potato', 'https://i.imgur.com/m1ui8Nz.png', 100),
    ('IG20', 'Banana', 'https://i.imgur.com/JpPoZ6z.png', 100),
    ('IG21', 'Chicken', 'https://i.imgur.com/r062VVE.png', 100),
    ('IG22', 'Corn', 'https://i.imgur.com/MZh2Gr8.png', 100),
    ('IG23', 'Chocolate', 'https://i.imgur.com/Q2RPSrL.png', 100),
    ('IG24', 'Salt', 'https://i.imgur.com/sOIYqiH.png', 100),
    ('IG25', 'Mineral Water', 'https://i.imgur.com/1I01Q45.png', 100),
    ('IG26', 'Spaghetti', 'https://i.imgur.com/gi9CGTM.png', 100),
    ('IG27', 'Flour', 'https://i.imgur.com/D4FLRoj.png', 100);

INSERT INTO `menus` (`id`, `name`, `link`, `type`, `price`) VALUES
    ('MN01', 'Cheeseburger', 'https://i.imgur.com/F8e7rgE.png', 'food', 20000.00),
    ('MN02', 'Veggie Salad', 'https://i.imgur.com/5NiHEDC.png', 'food', 35000.00),
    ('MN03', 'French Fries', 'https://i.imgur.com/YwCSUj6.png', 'food', 10000.00),
    ('MN04', 'Coffee', 'https://i.imgur.com/IQbbzkv.png', 'drink', 5000.00),
    ('MN05', 'Popcorn', 'https://i.imgur.com/0EGXyw5.png', 'food', 20000.00),
    ('MN06', 'Grape Juice', 'https://i.imgur.com/8W90xFP.png', 'drink', 10000.00),
    ('MN07', 'Cheese Fries', 'https://i.imgur.com/WgxnQwr.png', 'food', 20000.00),
    ('MN08', 'Cold Water', 'https://i.imgur.com/kF8Hw8O.png', 'drink', 5000.00),
    ('MN09', 'Cheesy Spaghetti', 'https://i.imgur.com/qnh3bcz.png', 'food', 10000.00),
    ('MN10', 'Strawberry Granita', 'https://i.imgur.com/IqMCx9Y.png', 'drink', 10000.00),
    ('MN11', 'Chocolate Milkshake', 'https://i.imgur.com/Sr1Mgx9.png', 'drink', 10000.00),
    ('MN12', 'Matcha Green Tea Boba', 'https://i.imgur.com/eFybUhB.png', 'drink', 15000.00),
    ('MN13', 'Banana Pancakes', 'https://i.imgur.com/ecMQpSx.png', 'food', 50000.00),
    ('MN14', 'Indomie Special', 'https://i.imgur.com/s9U6ryd.png', 'food', 25000.00);

INSERT INTO `menu_ingredients` (`menu_id`, `ingredient_id`, `quantity`) VALUES
    ('MN01', 'IG01', 2), ('MN01', 'IG02', 1), ('MN01', 'IG04', 1),
    ('MN02', 'IG01', 1), ('MN02', 'IG03', 1),
    ('MN03', 'IG19', 5), ('MN03', 'IG24', 1),
    ('MN04', 'IG11', 2), ('MN04', 'IG12', 3), ('MN04', 'IG14', 2),
    ('MN05', 'IG22', 10), ('MN05', 'IG24', 4),
    ('MN06', 'IG05', 2), ('MN06', 'IG11', 3), ('MN06', 'IG14', 1),
    ('MN07', 'IG02', 3), ('MN07', 'IG19', 5), ('MN07', 'IG24', 1),
    ('MN08', 'IG11', 4), ('MN08', 'IG25', 1),
    ('MN09', 'IG02', 5), ('MN09', 'IG26', 2),
    ('MN10', 'IG11', 4), ('MN10', 'IG13', 5), ('MN10', 'IG14', 2),
    ('MN11', 'IG10', 1), ('MN11', 'IG11', 4), ('MN11', 'IG14', 2), ('MN11', 'IG23', 5),
    ('MN12', 'IG06', 2), ('MN12', 'IG07', 5), ('MN12', 'IG11', 4), ('MN12', 'IG14', 2),
    ('MN13', 'IG09', 3), ('MN13', 'IG10', 1), ('MN13', 'IG20', 3), ('MN13', 'IG27', 2),
    ('MN14', 'IG08', 2), ('MN14', 'IG09', 1), ('MN14', 'IG15', 3), ('MN14', 'IG17', 2), ('MN14', 'IG18', 3), ('MN14', 'IG21', 1);

INSERT INTO `orders` (`id`, `employee_id`, `customer_name`, `order_time`, `status`, `total_price`, `order_status`) VALUES
    ('OR01', 'EM01', 'raihan', '2024-05-27 03:40:39', 'take away', 225000.00, 'processing'),
    ('OR02', 'EM01', 'coba satu', '2024-05-27 10:19:11', 'take away', 60000.00, 'processing'),
    ('OR03', 'EM01', 'coba dua', '2024-05-27 10:22:01', 'dine in', 45000.00, 'processing'),
    ('OR04', 'EM01', 'seno', '2024-05-27 16:59:16', 'dine in', 105000.00, 'processing'),
    ('OR05', 'EM01', 'raka', '2024-05-28 11:24:15', 'dine in', 105000.00, 'processing'),
    ('OR06', 'EM01', 'raihan', '2024-05-29 02:08:04', 'dine in', 105000.00, 'processing'),
    ('OR07', 'EM01', 'aidil', '2024-05-29 03:02:24', 'dine in', 60000.00, 'processing'),
    ('OR08', 'EM01', 'mirsa', '2024-05-29 03:06:10', 'dine in', 105000.00, 'processing'),
    ('OR09', 'EM02', 'asep standing', '2024-05-31 15:08:54', 'dine in', 105000.00, 'processing'),
    ('OR10', 'EM01', 'asep sentul', '2024-05-31 15:08:55', 'dine in', 105000.00, 'processing'),
    ('OR11', 'EM01', 'adhim', '2024-06-01 17:06:14', 'dine in', 60000.00, 'processing'),
    ('OR12', 'EM01', 'dika', '2024-06-01 17:22:26', 'dine in', 55000.00, 'processing'),
    ('OR13', 'EM01', 'rama', '2024-06-01 17:48:55', 'dine in', 25000.00, 'processing');

INSERT INTO `order_details` (`order_id`, `menu_id`, `quantity`, `price`) VALUES
    ('OR01', 'MN01', 3, 180000.00), ('OR01', 'MN02', 1, 45000.00),
    ('OR02', 'MN01', 1, 60000.00),
    ('OR03', 'MN02', 1, 45000.00),
    ('OR04', 'MN01', 1, 60000.00), ('OR04', 'MN02', 1, 45000.00),
    ('OR05', 'MN01', 1, 60000.00), ('OR05', 'MN02', 1, 45000.00),
    ('OR06', 'MN02', 1, 45000.00), ('OR06', 'MN01', 1, 60000.00),
    ('OR07', 'MN01', 1, 60000.00),
    ('OR08', 'MN01', 1, 60000.00), ('OR08', 'MN02', 1, 45000.00),
    ('OR09', 'MN01', 1, 60000.00), ('OR09', 'MN02', 1, 45000.00),
    ('OR10', 'MN02', 1, 45000.00), ('OR10', 'MN01', 1, 60000.00),
    ('OR11', 'MN01', 1, 20000.00), ('OR11', 'MN02', 1, 35000.00), ('OR11', 'MN04', 1, 5000.00),
    ('OR12', 'MN01', 1, 20000.00), ('OR12', 'MN02', 1, 35000.00),
    ('OR13', 'MN01', 1, 20000.00), ('OR13', 'MN04', 1, 5000.00);

INSERT INTO `stock_transactions` (`employee_id`, `order_id`, `ingredient_id`, `quantity`, `transaction_time`, `type`) VALUES
    ('EM01', 'OR01', 'IG01', 6, '2024-05-27 02:15:30', 'remove');