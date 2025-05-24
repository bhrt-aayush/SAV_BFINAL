import { useState, useEffect } from 'react';
import axios from 'axios';
import './List.css';

const List = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Default food image
  const defaultFoodImage = '/assets/default-food.png';

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/food/list');
      // Sort items by creation date (newest first)
      const sortedItems = response.data.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setFoodItems(sortedItems);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch food items');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.post('http://localhost:4000/api/food/remove', { id });
      setFoodItems(foodItems.filter(item => item._id !== id));
    } catch (err) {
      setError('Failed to delete food item');
    }
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = foodItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(foodItems.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultFoodImage;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/assets/')) return imagePath;
    return `/assets/${imagePath}`;
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = defaultFoodImage;
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="food-list-container">
      <h1>Food Items</h1>
      <div className="table-container">
        <table className="food-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Description</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item._id}>
                <td>
                  <div className="table-image-container">
                    <img 
                      src={getImageUrl(item.image)}
                      alt={item.name} 
                      className="table-food-image"
                      onError={handleImageError}
                    />
                  </div>
                </td>
                <td>{item.name}</td>
                <td>${item.price}</td>
                <td className="description-cell">{item.description}</td>
                <td>{item.category}</td>
                <td>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default List;
