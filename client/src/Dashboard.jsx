import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
    const { id: employeeId } = useParams();
    const [activeTab, setActiveTab] = useState('orderCreate');
    const [menus, setMenus] = useState([]);
    const [orders, setOrders] = useState([]);
    const [orderDetails, setOrderDetails] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [status, setStatus] = useState('dine in');
    const [ingredients, setIngredients] = useState({});
    const [allIngredients, setAllIngredients] = useState([]);

    useEffect(() => {
        fetchMenus();
        fetchOrders();
        fetchAllIngredients();
    }, []);

    const fetchMenus = async () => {
        const response = await axios.get('http://localhost:3032/menus');
        setMenus(response.data);
    };

    const fetchOrders = async () => {
        const response = await axios.get('http://localhost:3032/orders');
        setOrders(response.data);
    };

    const fetchAllIngredients = async () => {
        const response = await axios.get('http://localhost:3032/ingredients');
        setAllIngredients(response.data);
    };

    const fetchIngredients = async (menuId) => {
        const response = await axios.get(`http://localhost:3032/menu-ingredients/${menuId}`);
        setIngredients((prev) => ({ ...prev, [menuId]: response.data }));
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const addOrderDetail = (menuId, quantity) => {
        const menu = menus.find(m => m.id === menuId);
        if (menu) {
            setOrderDetails([...orderDetails, { menu_id: menuId, quantity, price: menu.price }]);
        }
    };

    const createOrder = async () => {
        const response = await axios.post('http://localhost:3032/create-order', {
            customer_id: customerId,
            employee_id: employeeId, // Mengambil employee_id dari URL
            status,
            items: orderDetails
        });

        if (response.data.success) {
            setOrderDetails([]);
            setCustomerName('');
            setCustomerId('');
            setStatus('dine in');
            fetchOrders();
        }
    };

    const completeOrder = async (orderId) => {
        const response = await axios.post('http://localhost:3032/complete-order', { orderId });
        if (response.data.success) {
            fetchOrders();
        }
    };

    return (
        <>
            <div className="orders">
                <div className="sideBar">
                    <div className="sideBarTop">
                        <div className={`sideButton ${activeTab === 'orderCreate' ? 'active' : ''}`} onClick={() => handleTabClick('orderCreate')}>
                            Create Order
                        </div>
                        <div className={`sideButton ${activeTab === 'orderQueue' ? 'active' : ''}`} onClick={() => handleTabClick('orderQueue')}>
                            Order Queue
                        </div>
                        <div className={`sideButton ${activeTab === 'orderHistory' ? 'active' : ''}`} onClick={() => handleTabClick('orderHistory')}>
                            Order History
                        </div>
                    </div>
                    <div className="sideBarBottom">
                        <div className={`sideButton ${activeTab === 'menus' ? 'active' : ''}`} onClick={() => handleTabClick('menus')}>
                            Menu
                        </div>
                        <div className={`sideButton ${activeTab === 'ingredients' ? 'active' : ''}`} onClick={() => handleTabClick('ingredients')}>
                            Ingredients
                        </div>
                    </div>
                </div>

                <div className="dashboard">
                    {activeTab === 'orderCreate' && (
                        <div className="orderTemplate orderCreate">
                            <h2>Create Order</h2>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                createOrder();
                            }}>
                                <label>Employee ID:</label>
                                <input type="text" name="employee_id" readOnly value={employeeId} />
                                <label>Customer Name:</label>
                                <input type="text" name="customer_name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                                <label>Customer ID:</label>
                                <input type="text" name="customer_id" value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
                                <label>Order Time:</label>
                                <input type="text" name="order_time" readOnly value={ new Date().toLocaleString()} />
                                <label>Status:</label>
                                <select name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="dine in">Dine In</option>
                                    <option value="take away">Take Away</option>
                                </select>
                                <label>Menu:</label>
                                <div>
                                    {menus.map(menu => (
                                        <div key={menu.id}>
                                            <input type="checkbox" id={`menu-${menu.id}`} onChange={() => addOrderDetail(menu.id, 1)} />
                                            <label htmlFor={`menu-${menu.id}`}>{menu.name} - ${menu.price}</label>
                                        </div>
                                    ))}
                                </div>
                                <button type="submit">Create Order</button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'orderQueue' && (
                        <div className="orderTemplate orderQueue">
                            <h2>Order Queue</h2>
                            {orders.map(order => (
                                <div key={order.id}>
                                    Order {order.id}
                                    <button onClick={() => completeOrder(order.id)}>Complete</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'orderHistory' && (
                        <div className="orderTemplate orderHistory">
                            <h2>Order History</h2>
                            {orders.map(order => (
                                <div key={order.id}>
                                    <p>Order {order.id}</p>
                                    <button onClick={() => completeOrder(order.id)}>Complete</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'menus' && (
                        <div className="orderTemplate menus">
                            <h2>Menu</h2>
                            {menus.map(menu => (
                                <div key={menu.id}>
                                    <p>{menu.name} - ${menu.price}</p>
                                </div>
                            ))}
                        </div>   
                    )}

                    {activeTab === 'ingredients' && (
                        <div className="orderTemplate ingredients">
                            <h2>Ingredients</h2>
                            {allIngredients.map(ingredient => (
                                <div key={ingredient.id}>
                                    <p>{ingredient.name} - Stock: {ingredient.stock}</p>
                                </div>
                            ))}
                        </div>                    
                    )}
                </div>
            </div>
        </>
    );
}

export default Dashboard;