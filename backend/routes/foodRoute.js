import express from "express";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";
import foodModel from "../models/foodModel.js";
import multer from "multer";

const foodRouter = express.Router();

// Image storage engine
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Initialize multer
const upload = multer({ storage: storage });

// Define the route after initializing upload
foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list",listFood)
foodRouter.post("/remove",removeFood)

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
