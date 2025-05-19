import express from 'express';
import cors from 'cors';
import Database from './config/db.js';
import foodRouter from './routes/foodRoute.js';
import userRouter from './routes/userRoute.js';
import adminRouter from './routes/adminRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app config
const app = express();
const port = 4000;

// middleware
app.use(express.json());
app.use(cors());

// Serve static files from multiple directories
app.use('/assets', express.static(path.join(__dirname, 'uploads')));
app.use('/admin/assets', express.static(path.join(__dirname, 'admin/public/assets')));
app.use('/frontend/assets', express.static(path.join(__dirname, 'frontend/public/assets')));

// db connection
Database.getInstance().connectDB('mongodb+srv://ayu:1122@cluster0.crrax0u.mongodb.net/fyp-savorybytes', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// api endpoints
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/reviews", reviewRouter);

app.get("/", (req, res) => {
    res.send("API working");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// mongodb+srv://ayu:112233@cluster0.crrax0u.mongodb.net/
