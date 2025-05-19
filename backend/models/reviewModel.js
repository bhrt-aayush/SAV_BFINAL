import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'food',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    message: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel; 