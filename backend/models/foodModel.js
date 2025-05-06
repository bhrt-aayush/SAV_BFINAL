import mongoose from "mongoose";

// Drop existing indexes if they exist
const dropIndexes = async () => {
    try {
        const collection = mongoose.connection.collection('foods');
        await collection.dropIndexes();
        console.log('Successfully dropped all indexes');
    } catch (error) {
        console.error('Error dropping indexes:', error);
    }
};

const foodSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    image: {type: String, required: true},
    category: {type: String, required: true}
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    _id: true // Explicitly enable _id
});

// Drop indexes when the model is first created
if (!mongoose.models.food) {
    dropIndexes();
}

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);
 
export default foodModel;