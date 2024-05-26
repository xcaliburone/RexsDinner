import { useState, useEffect, useCallback } from 'react';
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
    const [status, setStatus] = useState('dine in');
    const [allIngredients, setAllIngredients] = useState([]);
    const [menuQuantities, setMenuQuantities] = useState({});
    const [menuIngredients, setMenuIngredients] = useState({});

    const orderTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    const fetchMenuIngredients = useCallback(async (menus) => {
        try {
            const menuIngredientRequests = menus.map(menu => axios.get(`http://localhost:3032/menu-ingredients/${menu.id}`));
            const responses = await Promise.all(menuIngredientRequests);
            const menuIngredientData = responses.reduce((acc, response, index) => {
                acc[menus[index].id] = response.data;
                return acc;
            }, {});
            setMenuIngredients(menuIngredientData);
        } catch (error) {
            console.error('Error fetching menu ingredients:', error);
        }
    }, []);

    const fetchMenus = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3032/menus');
            setMenus(response.data);
            fetchMenuIngredients(response.data);
        } catch (error) {
            console.error('Error fetching menus:', error);
        }
    }, [fetchMenuIngredients]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:3032/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const fetchAllIngredients = async () => {
        try {
            const response = await axios.get('http://localhost:3032/ingredients');
            setAllIngredients(response.data);
        } catch (error) {
            console.error('Error fetching ingredients:', error);
        }
    };

    useEffect(() => {
        fetchMenus();
        fetchOrders();
        fetchAllIngredients();
    }, [fetchMenus]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const createOrder = async () => {
        try {
            const response = await axios.post(`http://localhost:3032/create-order/${employeeId}`, {
                customer_name: customerName,
                status,  // Set the status as 'dine in' or 'take away'
                order_status: 'processing',  // Set initial order status as 'processing'
                items: orderDetails,
                orderTime
            });

            if (response.data.success) {
                // Reset form
                setOrderDetails([]);
                setCustomerName('');
                setStatus('dine in');  // Reset status to default
                fetchOrders();
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error("Error creating order:", error);
        }
    };

    const addOrderDetail = (menuId, quantity) => {
        const menu = menus.find(m => m.id === menuId);
        if (menu) {
            const newOrderDetail = { menu_id: menuId, quantity, price: menu.price };
            setOrderDetails(prevOrderDetails => [...prevOrderDetails, newOrderDetail]);
        }
    };

    const updateMenuQuantity = (menuId, quantity) => {
        setMenuQuantities(prevState => ({
            ...prevState,
            [menuId]: quantity
        }));

        addOrderDetail(menuId, quantity);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createOrder();
    };

    const completeOrder = async (orderId) => {
        try {
            await axios.put(`http://localhost:3032/complete-order/${orderId}`);
            fetchOrders();
        } catch (error) {
            console.error('Error completing order:', error);
        }
    };

    // const updateOrderStatus = async (orderId, newOrderStatus) => {
    //     try {
    //         const response = await axios.put(`http://localhost:3032/update-order-status/${orderId}`, { order_status: newOrderStatus });
    //         if (response.data.success) {
    //             fetchOrders(); // Refresh the orders list
    //         } else {
    //             alert(response.data.message);
    //         }
    //     } catch (error) {
    //         console.error("Error updating order status:", error);
    //     }
    // };

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
                    )}

                    {/* {activeTab === 'orderQueue' && (
                        <div className="orderTemplate orderQueue">
                            <h2>Order Queue</h2>
                            <div className='bungkus'>
                                {orders.filter(order => order.order_status === 'processing').map(order => (
                                    <div className='orderItem' key={order.id}>
                                        <p>Name : {order.customer_name}</p>
                                        <p>Order Type: {order.status}</p>
                                        <p>Status : {order.order_status}</p>
                                        <button onClick={() => updateOrderStatus(order.id, 'completed')}>Complete Order</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )} */}

                    {activeTab === 'orderQueue' && (
                        <div className="orderTemplate orderQueue">
                            <h2>Order Queue</h2>
                            <div className='bungkus'>
                                {orders.filter(order => order.order_status === 'processing').map(order => (
                                    <div className='orderItem' key={order.id}>
                                        <p>Name : {order.customer_name}</p>
                                        <p>Order Type: {order.status}</p>
                                        <p>Status : {order.order_status}</p>
                                        {/* Tombol untuk menyelesaikan pesanan */}
                                        <button onClick={() => completeOrder(order.id)}>Complete Order</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'orderHistory' && (
                        <div className="orderTemplate orderHistory">
                            <h2>Order History</h2>
                            <div className='bungkus'>
                                {orders.filter(order => order.order_status === 'completed').map(order => (
                                    <div className='orderItem' key={order.id}>
                                        <p>Name : {order.customer_name}</p>
                                        <p>Order Type: {order.status}</p>
                                        <p>Status : {order.order_status}</p>
                                    </div>
                                ))}
                            </div>
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
                                        <p>Ingredients</p>
                                        <ul>
                                            {menuIngredients[menu.id] && menuIngredients[menu.id].map((ingredient, index) => (
                                                <li key={index}>{ingredient.quantity} {ingredient.name}</li>
                                            ))}
                                        </ul>
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
