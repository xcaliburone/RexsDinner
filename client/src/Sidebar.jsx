// import React from 'react';
import PropTypes from 'prop-types';

function Sidebar({ activeTab, handleTabClick }) {
    return (
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
    );
}

Sidebar.propTypes = {
    activeTab: PropTypes.string.isRequired,
    handleTabClick: PropTypes.func.isRequired,
};

export default Sidebar;