import reviewModel from '../models/reviewModel.js';

// Add a review
export const addReview = async (req, res) => {
    try {
        const { foodId, rating, message } = req.body;
        const userId = req.user.id; // From auth middleware

        console.log('Adding review:', { foodId, userId, rating, message });

        if (!foodId || !rating || !message) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields" 
            });
        }

        const review = new reviewModel({
            foodId,
            userId,
            rating,
            message
        });

        await review.save();
        console.log('Review saved successfully:', review);
        
        res.json({ 
            success: true, 
            message: "Review added successfully", 
            data: review 
        });
    } catch (error) {
        console.error("❌ Error adding review:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error adding review",
            error: error.message 
        });
    }
};

// Get reviews for a food item
export const getFoodReviews = async (req, res) => {
    try {
        const { foodId } = req.params;
        console.log('Fetching reviews for foodId:', foodId);

        const reviews = await reviewModel.find({ foodId })
            .populate('userId', 'name') // Populate user name
            .sort({ createdAt: -1 }); // Sort by newest first

        console.log(`Found ${reviews.length} reviews`);
        res.json({ success: true, data: reviews });
    } catch (error) {
        console.error("❌ Error fetching reviews:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching reviews",
            error: error.message 
        });
    }
}; 