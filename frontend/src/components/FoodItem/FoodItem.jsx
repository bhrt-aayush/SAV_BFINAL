import React, { useContext, useState, useEffect } from 'react'
import './FoodItem.css'
import { assets } from '../../../public/assets/frontend_assets/assets'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios';

const FoodItem = ({id, name, price, description, image}) => {
    const {cartItems, addToCart, removeFromCart} = useContext(StoreContext);
    const [reviews, setReviews] = useState([]);
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(5);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [id]);

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/reviews/${id}`);
            if (response.data.success) {
                setReviews(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setError('Failed to load reviews');
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please login to submit a review');
                return;
            }

            const response = await axios.post('http://localhost:4000/api/reviews/add', {
                foodId: id,
                rating,
                message
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setMessage('');
                setRating(5);
                setShowReviewForm(false);
                await fetchReviews();
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            setError(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='food-item'>
            <div className="food-item-img-container">
                <img className='food-item-image' src={image} alt="" />
                {!cartItems[id]
                    ? <img className='add' onClick={()=>addToCart(id)} src={assets.add_icon_white} alt="" />      
                    : <div className="food-item-counter">
                        <img onClick={()=>removeFromCart(id)} src={assets.remove_icon_red} alt="" />
                        <p>{cartItems[id]}</p>
                        <img onClick={()=>addToCart(id)} src={assets.add_icon_green} alt="" />
                    </div>
                }
            </div>
            <div className="food-item-info">
                <div className="food-item-name-rating">
                    <p>{name}</p>
                </div>
                <p className="food-item-desc">{description}</p>
                <p className="food-item-price">रु{price}</p>

                {/* Reviews Section */}
                <div className="reviews-section">
                    <div className="reviews-header">
                        <h4>Reviews</h4>
                        {isLoggedIn && (
                            <button 
                                className="add-review-btn"
                                onClick={() => setShowReviewForm(!showReviewForm)}
                            >
                                {showReviewForm ? 'Cancel' : 'Add Review'}
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {showReviewForm && (
                        <form onSubmit={handleSubmitReview} className="review-form">
                            <textarea
                                placeholder="Write your review"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <div className="rating-input">
                                <label>Rating:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={rating}
                                    onChange={(e) => setRating(Number(e.target.value))}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <button type="submit" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    )}

                    <div className="existing-reviews">
                        {reviews.length === 0 ? (
                            <p>No reviews yet.</p>
                        ) : (
                            reviews.map((review, index) => (
                                <div key={index} className="review-item">
                                    <div className="review-header">
                                        <span className="review-rating">Rating: {review.rating}/5</span>
                                        <span className="review-author">
                                            By: {review.userId?.name || "Anonymous"}
                                        </span>
                                    </div>
                                    <p className="review-message">{review.message}</p>
                                    <small className="review-date">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </small>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FoodItem