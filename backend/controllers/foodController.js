import foodModel from "../models/foodModel.js";
import fs from 'fs'

// Add food item
export const addFood = async (req, res) => {
    try {
        let image_filename = req.file?.filename || "";
        const last_food = await foodModel.findOne().sort({ _id: -1 });
        const last_food_name = last_food ? last_food.name : "Food-0";
        const last_food_number = parseInt(last_food_name.split("-")[1]) + 1;
        const new_food_name = `${last_food_number}.png`;

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: "/assets/" + new_food_name,
        });

        await food.save();
        res.json({ success: true, message: "Food Added" });
    } catch (error) {
        console.error("❌ Error adding food:", error);
        res.status(500).json({ success: false, message: "Error adding food" });
    }
};

// List all food items
export const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({ success: true, data: foods });
    } catch (error) {
        console.error("❌ Error fetching food list:", error);
        res.status(500).json({ success: false, message: "Error fetching food list" });
    }
};

// Remove food item
export const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }

        if (food.image) {
            fs.unlink(`uploads/${food.image}`, (err) => {
                if (err) console.warn("⚠️ Error deleting image file:", err);
            });
        }

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food Removed" });
    } catch (error) {
        console.error("❌ Error removing food:", error);
        res.status(500).json({ success: false, message: "Error removing food" });
    }
};

// export { addFood, listFood, removeFood };