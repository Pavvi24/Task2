import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import taskRoutes from "./routes/taskRoutes.js";

console.log("Step 1: File loaded");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("Step 2: Express setup done");

app.use("/api/tasks", taskRoutes);

const PORT = 5001;

console.log("Step 3: Connecting to MongoDB...");

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("Step 4: MongoDB Connected");

    app.listen(PORT, () => {
        console.log(`Step 5: Server running on port ${PORT}`);
    });
})
.catch(err => {
    console.log("Step ERROR:", err.message);
});
