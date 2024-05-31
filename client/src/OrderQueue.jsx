// import React from 'react';
import PropTypes from 'prop-types';

function OrderQueue({ orders, completeOrder }) {
    const orderQueue = orders.filter(order => order.order_status === 'processing');

    return (
        <div className="orderTemplate orderQueue">
            <h2>Order Queue</h2>
            <div className="paok">.</div>
            {orderQueue.map(order => (
                <div className='orderItem' key={order.order_id}>
                    <p>Order ID: {order.order_id}</p>
                    <p>Customer Name: {order.customer_name}</p>
                    <p>Status: {order.status}</p>
                    <p>Order Status: {order.order_status}</p>
                    <p>Order Time: {new Date(order.order_time).toLocaleTimeString()} | {new Date(order.order_time).toLocaleDateString()}</p>
                    <p>Total Price: ${order.total_price}</p>
                    <p>Items:</p>
                    <ul>
                        {order.menu_items.split(' | ').map((item, index) => (
                            <li key={index}>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <p>Ingredients:</p>
                    <ul>
                        {order.ingredients.split(' | ').map((ingredient, index) => (
                            <li key={index}>
                                {ingredient}
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => completeOrder(order.order_id)}>Complete Order</button>
                </div>
            ))}
        </div>
    );
}

OrderQueue.propTypes = {
    orders: PropTypes.arrayOf(
        PropTypes.shape({
            order_id: PropTypes.string.isRequired,
            customer_name: PropTypes.string.isRequired,
            status: PropTypes.string.isRequired,
            order_status: PropTypes.string.isRequired,
            order_time: PropTypes.string.isRequired,
            total_price: PropTypes.number.isRequired,
            menu_items: PropTypes.string.isRequired,
            ingredients: PropTypes.string.isRequired,
        })
    ).isRequired,
    completeOrder: PropTypes.func.isRequired,
};

export default OrderQueue;