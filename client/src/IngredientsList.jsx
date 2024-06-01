import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import io from 'socket.io-client';
const socket = io('http://localhost:3032');

function IngredientsList({ allIngredients, setAllIngredients }) {
    const [isAdding, setIsAdding] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [additionalStock, setAdditionalStock] = useState('');

    const handleAddClick = (ingredient) => {
        setSelectedIngredient(ingredient);
        setIsAdding(true);
    };

    const handleStockChange = (e) => { setAdditionalStock(e.target.value); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedIngredient && additionalStock) {
            const additionalStockValue = parseInt(additionalStock, 10);
            try {
                await axios.put(`http://localhost:3032/ingredients/${selectedIngredient.id}`, { stock: additionalStockValue });
                setAllIngredients(prevIngredients =>
                    prevIngredients.map(ingredient =>
                        ingredient.id === selectedIngredient.id ? { ...ingredient, stock: ingredient.stock + additionalStockValue } : ingredient
                    )
                );
                setAdditionalStock('');
                setIsAdding(false);
                setSelectedIngredient(null);
            } catch (error) { console.error('Error updating ingredient stock:', error); }
        }
    };

    const handleCloseClick = () => {
        setIsAdding(false);
        setSelectedIngredient(null);
        setAdditionalStock('');
    };

    useEffect(() => {
        socket.on('stockUpdated', ({ ingredientId, newStock }) => {
            setAllIngredients(prevIngredients =>
                prevIngredients.map(ingredient => ingredient.id === ingredientId ? { ...ingredient, stock: newStock } : ingredient)
            );
        });
        return () => { socket.off('stockUpdated'); };
    }, [setAllIngredients]);

    return (
        <div className="orderTemplate ingredients">
            <h2>Ingredients</h2>
            <div className="bungkus">
                {allIngredients.map(ingredient => (
                    <div className='ingredientsItem' key={ingredient.id}>
                        <div className="ingredientsIcon">
                            <img src={ingredient.link} alt="ingredientsIcon" />
                        </div>
                        <div className="ingredientDesc">
                            <p>Name : {ingredient.name}</p>
                            <p>Stock : {ingredient.stock} pcs</p>
                        </div>
                        <button className='ingredientsButton' onClick={() => handleAddClick(ingredient)}>Add Stock</button>
                    </div>
                ))}
            </div>

            {isAdding && selectedIngredient && (
                <form onSubmit={handleSubmit} className="addIngredientForm">
                    <button className="closeButton" onClick={handleCloseClick}>X</button>
                    <h3>Add Stock for {selectedIngredient.name}</h3>
                    <label>
                        <p className='additionalStock'>Additional Stock:</p>
                        <input type="number" value={additionalStock} onChange={handleStockChange} required />
                    </label>
                    <button type="submit">Submit</button>
                    <button type="button" onClick={() => setIsAdding(false)}>Cancel</button>
                </form>
            )}
        </div>
    );
}

IngredientsList.propTypes = {
    allIngredients: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            stock: PropTypes.number.isRequired,
            link: PropTypes.string.isRequired,
        })
    ).isRequired,
    setAllIngredients: PropTypes.func.isRequired,
};
export default IngredientsList;