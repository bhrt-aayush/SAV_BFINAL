import express from "express";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";
import foodModel from "../models/foodModel.js";
import multer from "multer";
import path from 'path';
import fs from 'fs';

const foodRouter = express.Router();

// Ensure upload directories exist
const createUploadDirs = () => {
    const dirs = [
        'uploads',
        'admin/public/assets',
        'frontend/public/assets'
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createUploadDirs();

// Image storage engine
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const filename = `Food-${timestamp}${ext}`;
        return cb(null, filename);
    }
});

// Initialize multer
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Define the route after initializing upload
foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);

foodRouter.get("/getfood/:id", async (req, res) => {
    try {
        const food = await foodModel.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }
        res.json({ success: true, data: food });
    } catch (error) {
        console.error("❌ Error fetching food item:", error);
        res.status(500).json({ success: false, message: "Error fetching food item" });
    }
}
);

foodRouter.get("/", async (req, res) => {
    try {
        const food = await foodModel.find();
        if (!food) {
            return res.status(404).json({ success: false, message: "Food item not found" });
        }
        res.json({ success: true, data: food });
    } catch (error) {
        console.error("❌ Error fetching food item:", error);
        res.status(500).json({ success: false, message: "Error fetching food item" });
    }
});

export default foodRouter;
