import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

function Dashboard() {
    const { employeeId } = useParams();
    const [activeTab, setActiveTab] = useState('orderCreate');
    const [menus, setMenus] = useState([]);
    const [orders, setOrders] = useState([]);
    const [orderDetails, setOrderDetails] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [status, setStatus] = useState('dine in');
    const [ingredients, setIngredients] = useState({});
    const [allIngredients, setAllIngredients] = useState([]);
    const [menuQuantities, setMenuQuantities] = useState({});

    const orderTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

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
        try {
            const response = await axios.post(`http://localhost:3032/create-order/${employeeId}`, {
                customer_id: customerId,
                customer_name: customerName,
                status,
                items: orderDetails,
                orderTime
            });
    
            if (response.data.success) {
                // Reset form
                setOrderDetails([]);
                setCustomerName('');
                setCustomerId('');
                setStatus('dine in');
                fetchOrders();
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error("Error creating order:", error);
        }
    };

    const completeOrder = async (orderId) => {
        const response = await axios.post('http://localhost:3032/complete-order', { orderId });
        if (response.data.success) {
            fetchOrders();
        }
    };

    const updateMenuQuantity = (menuId, quantity) => {
        setMenuQuantities(prevState => ({
            ...prevState,
            [menuId]: quantity
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Ensure the order details are up-to-date before creating the order
        createOrder();
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
                            <form className='orderForm' onSubmit={handleSubmit}>
                                {/* Hapus Employee ID */}
                                
                                <label>Customer Name:</label>
                                <input type="text" name="customer_name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />

                                {/* Buat Customer ID otomatis */}
                                {/* <label>Customer ID:</label>
                                <input type="text" name="customer_id" value={customerId} readOnly /> */}
                                {/* Customer ID otomatis dapat ditambahkan di sini */}

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
                            <div className='bungkus'>
                                {menus.map(menu => (
                                    <div className='menusItem' key={menu.id}>
                                        <p>Name : {menu.name}</p>
                                        <p>Price : Rp.{menu.price}</p>
                                    </div>
                                ))}
                            </div>
                        </div>   
                    )}

                    {activeTab === 'ingredients' && (
                        <div className="orderTemplate ingredients">
                            <h2>Ingredients</h2>
                            <div className="bungkus">
                                {allIngredients.map(ingredient => (
                                    <div className='ingredientsItem' key={ingredient.id}>
                                        <p>Name : {ingredient.name}</p>
                                        <p>Stock : {ingredient.stock} pcs</p>
                                    </div>
                                ))}
                            </div>
                        </div>                    
                    )}
                </div>
            </div>
        </>
    );
}

export default Dashboard;