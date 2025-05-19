import express from 'express';
import { addReview, getFoodReviews } from '../controllers/reviewController.js';
import authMiddleware from '../middleware/auth.js';

const reviewRouter = express.Router();

// Add a review (requires authentication)
reviewRouter.post('/add', authMiddleware, addReview);

// Get reviews for a food item
reviewRouter.get('/:foodId', getFoodReviews);

export default reviewRouter; 