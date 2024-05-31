import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';
import OrderQueue from './OrderQueue';
import OrderHistory from './OrderHistory';
import OrderCreate from './OrderCreate';
import MenuList from './MenuList';
import IngredientsList from './IngredientsList';
import Sidebar from './Sidebar';

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
            const menuIngredientData = responses.reduce((acc, response, index) => { acc[menus[index].id] = response.data; return acc; }, {});
            setMenuIngredients(menuIngredientData);
        } catch (error) { console.error('Error fetching menu ingredients:', error); }
    }, []);

    const fetchMenus = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3032/menus');
            setMenus(response.data);
            fetchMenuIngredients(response.data);
        } catch (error) { console.error('Error fetching menus:', error); }
    }, [fetchMenuIngredients]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:3032/orders');
            setOrders(response.data);
        } catch (error) { console.error('Error fetching orders:', error); }
    };
    
    const fetchAllIngredients = async () => {
        try {
            const response = await axios.get('http://localhost:3032/ingredients');
            setAllIngredients(response.data);
        } catch (error) { console.error('Error fetching ingredients:', error); }
    };
    useEffect(() => { fetchMenus(); fetchOrders(); fetchAllIngredients(); }, [fetchMenus]);

    const handleTabClick = (tab) => { setActiveTab(tab); };
    const createOrder = async () => {
        try {
            const response = await axios.post(`http://localhost:3032/create-order/${employeeId}`, {
                customer_name: customerName, status, order_status: 'processing', items: orderDetails, orderTime
            });
            if (response.data.success) { // Reset form
                setOrderDetails([]); setCustomerName(''); setStatus('dine in'); fetchOrders();
            } else { alert(response.data.message); }
        } catch (error) { console.error("Error creating order:", error); }
    };

    const addOrderDetail = (menuId, quantity) => {
        const menu = menus.find(m => m.id === menuId);
        if (menu) {
            const newOrderDetail = { menu_id: menuId, quantity, price: menu.price };
            setOrderDetails(prevOrderDetails => [...prevOrderDetails, newOrderDetail]);
        }
    };

    const updateMenuQuantity = (menuId, quantity) => {
        setMenuQuantities(prevState => ({ ...prevState, [menuId]: quantity }));
        addOrderDetail(menuId, quantity);
    };

    const handleSubmit = (e) => { e.preventDefault(); createOrder(); };
    const completeOrder = async (orderId) => {
        try {
            await axios.put(`http://localhost:3032/complete-order/${orderId}/${employeeId}`);
            fetchOrders();
        } catch (error) { console.error('Error completing order:', error); }
    };

    return (
        <>
        <div className="orders">
            <Sidebar activeTab={activeTab} handleTabClick={handleTabClick} />

            <div className="dashboard">
                {activeTab === 'orderCreate' && (
                    <OrderCreate menus={menus} menuQuantities={menuQuantities} customerName={customerName} status={status} orderTime={orderTime}
                        setCustomerName={setCustomerName} setStatus={setStatus} updateMenuQuantity={updateMenuQuantity} handleSubmit={handleSubmit}
                    />
                )}
                {activeTab === 'orderQueue' && ( <OrderQueue orders={orders} completeOrder={completeOrder} /> )}
                {activeTab === 'orderHistory' && ( <OrderHistory orders={orders} /> )}
                {activeTab === 'menus' && ( <MenuList menus={menus} menuIngredients={menuIngredients} /> )}
                {activeTab === 'ingredients' && ( <IngredientsList allIngredients={allIngredients} setAllIngredients={setAllIngredients} /> )}
            </div>
        </div>
        </>
    );
}
export default Dashboard;