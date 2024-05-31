// import React from 'react';
import PropTypes from 'prop-types';

// function OrderCreate({ menus, menuQuantities, customerName, status, orderTime, setCustomerName, setStatus, updateMenuQuantity, handleSubmit }) {
function OrderCreate({ menus, menuQuantities, customerName, status, setCustomerName, setStatus, updateMenuQuantity, handleSubmit }) {
    return (
        <div className="orderTemplate orderCreate">
            <h2>Create Order</h2>
            <form className='orderForm' onSubmit={handleSubmit}>
                <label>Customer Name:</label>
                <input type="text" name="customer_name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />

                <label>Order Time:</label>
                <input type="text" name="order_time" readOnly value={new Date().toLocaleString()} />

                <label>Status:</label>
                <select className='statusSelect' name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="dine in">Dine In</option>
                    <option value="take away">Take Away</option>
                </select>

                <label>Menu:</label>
                <div className='menuOpt'>
                    {menus.map(menu => (
                        <div className='menusOptions' key={menu.id}>
                            <label htmlFor={`menu-${menu.id}`}>{menu.name} - ${menu.price}</label>
                            <input type="number" id={`menu-${menu.id}`} min="1" value={menuQuantities[menu.id] || ''} onChange={(e) => updateMenuQuantity(menu.id, parseInt(e.target.value))} />
                        </div>
                    ))}
                </div>
                <button type="submit">Create Order</button>
            </form>
        </div>
    );
}

OrderCreate.propTypes = {
    menus: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            price: PropTypes.number.isRequired,
        })
    ).isRequired,
    menuQuantities: PropTypes.object.isRequired,
    customerName: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    setCustomerName: PropTypes.func.isRequired,
    setStatus: PropTypes.func.isRequired,
    updateMenuQuantity: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
};

export default OrderCreate;