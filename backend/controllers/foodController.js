import foodModel from "../models/foodModel.js";
import fs from 'fs';
import path from 'path';

// Add food item
export const addFood = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image file uploaded" });
        }

        const uploadedFile = req.file;
        const filename = uploadedFile.filename;
        
        // Copy file to admin and frontend assets directories
        const copyFile = (source, destination) => {
            try {
                fs.copyFileSync(source, destination);
            } catch (error) {
                console.error(`Error copying file to ${destination}:`, error);
            }
        };

        // Copy to admin assets
        copyFile(
            path.join('uploads', filename),
            path.join('C:/Users/Numbur iT/OneDrive/Desktop/SAV_BFINAL/admin/public/assets', filename)
        );

        // Copy to frontend assets
        copyFile(
            path.join('uploads', filename),
            path.join('C:/Users/Numbur iT/OneDrive/Desktop/SAV_BFINAL/frontend/public/assets', filename)
        );

        // Create new food item without any custom id
        const foodData = {
            name: req.body.name,
            description: req.body.description,
            price: Number(req.body.price),
            category: req.body.category,
            image: `/assets/${filename}`
        };

        const food = new foodModel(foodData);
        const savedFood = await food.save();

        res.json({ 
            success: true, 
            message: "Food Added",
            data: savedFood
        });
    } catch (error) {
        console.error("❌ Error adding food:", error);
        // Clean up uploaded file if there's an error
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error deleting uploaded file:", err);
            });
        }
        res.status(500).json({ 
            success: false, 
            message: "Error adding food",
            error: error.message 
        });
    }
};

// List all food items
export const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({}).sort({ createdAt: -1 });
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

        // Extract filename from image path
        const filename = path.basename(food.image);
        
        // Delete files from all locations
        const locations = [
            path.join('uploads', filename),
            path.join('admin/public/assets', filename),
            path.join('frontend/public/assets', filename)
        ];

        locations.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.warn(`⚠️ Error deleting file ${filePath}:`, err);
                });
            }
        });

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food Removed" });
    } catch (error) {
        console.error("❌ Error removing food:", error);
        res.status(500).json({ success: false, message: "Error removing food" });
    }
};

// export { addFood, listFood, removeFood };