import express from 'express';
import cors from 'cors';
import Database from './config/db.js';
import foodRouter from './routes/foodRoute.js';
import userRouter from './routes/userRoute.js';
import 'dotenv/config';

// app config
const app = express();
const port = 4000;

// middleware
app.use(express.json());
app.use(cors());

// db connection
Database.getInstance().connectDB('mongodb+srv://ayu:1122@cluster0.crrax0u.mongodb.net/fyp-savorybytes', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// api endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static('uploads'));
app.use("/api/user", userRouter);  // Added missing forward slash

app.get("/", (req, res) => {
    res.send("API working");
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});

// mongodb+srv://ayu:112233@cluster0.crrax0u.mongodb.net/
