// import React from 'react';
import PropTypes from 'prop-types';

function IngredientsList({ allIngredients }) {
    return (
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
    );
}

IngredientsList.propTypes = {
    allIngredients: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            stock: PropTypes.number.isRequired,
        })
    ).isRequired,
};

export default IngredientsList;