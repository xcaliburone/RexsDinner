// import React from 'react';
import PropTypes from 'prop-types';

function IngredientsList({ allIngredients }) {
    return (
        <div className="orderTemplate ingredients">
            <button>Add</button>
            <h2>Ingredients</h2>
            <div className="bungkus">
                {allIngredients.map(ingredient => (
                    <div className='ingredientsItem' key={ingredient.id}>
                        <div className="ingredientsIcon">
                            <img src={ingredient.link} alt="ingredientsIcon" />
                        </div>
                        <div className="ingredientDessc">
                            <p>Name : {ingredient.name}</p>
                            <p>Stock : {ingredient.stock} pcs</p>
                        </div>
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