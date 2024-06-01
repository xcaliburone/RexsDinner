import PropTypes from 'prop-types';

function OrderHistory({ orders }) {
    const orderHistory = orders.filter(order => order.order_status === 'completed');

    return (
        <div className="orderTemplate orderHistory">
            <h2>Order History</h2><div className="paok">.</div>
            {orderHistory.map(order => (
                <div className='orderItem' key={order.order_id}>
                    <p>Order ID: {order.order_id}</p>
                    <p>Customer Name: {order.customer_name}</p>
                    <p>Status: {order.status}</p>
                    <p>Order Status: {order.order_status}</p>
                    <p>Order Time: {new Date(order.order_time).toLocaleTimeString()} | {new Date(order.order_time).toLocaleDateString()}</p>
                    <p>Total Price: Rp. {order.total_price}</p>
                    <p>Items:</p>
                    <ul>{order.menu_items.split(' | ').map((item, index) => ( <li key={index}>{item}</li> ))}</ul>
                    <p>Ingredients:</p>
                    <ul>{order.ingredients.split(' | ').map((ingredient, index) => ( <li key={index}>{ingredient}</li> ))}</ul>
                </div>
            ))}
        </div>
    );
}

OrderHistory.propTypes = {
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
};
export default OrderHistory;