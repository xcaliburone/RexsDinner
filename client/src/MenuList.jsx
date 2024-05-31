// import React from 'react';
import PropTypes from 'prop-types';

function MenuList({ menus, menuIngredients }) {
    return (
        <div className="orderTemplate menus">
            <h2>Menu</h2>
            <div className='bungkus'>
                {menus.map(menu => (
                    <div className='menusItem' key={menu.id}>
                        <div className='menusIcon'><img src={menu.link} alt="menusIcon" /></div>
                        <div className="menusDesc">
                            <p>Name : {menu.name}</p>
                            <p>Price : Rp.{menu.price}</p>
                            <p>Ingredients</p>
                            <ul>
                                {menuIngredients[menu.id] && menuIngredients[menu.id].map((ingredient, index) => (
                                    <li key={index}>{ingredient.quantity} {ingredient.name}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

MenuList.propTypes = {
    menus: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            link: PropTypes.string,
            price: PropTypes.number.isRequired,
        })
    ).isRequired,
    menuIngredients: PropTypes.objectOf(
        PropTypes.arrayOf(
            PropTypes.shape({
                quantity: PropTypes.number.isRequired,
                name: PropTypes.string.isRequired,
            })
        )
    ).isRequired,
};
export default MenuList;