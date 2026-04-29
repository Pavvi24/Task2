import express from "express";
import Task from "../models/Task.js";

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
    try {
        const task = await Task.create(req.body);
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET
router.get("/", async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks);
});

// UPDATE (for edit + complete toggle)
router.put("/:id", async (req, res) => {
    const task = await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    res.json(task);
});

// DELETE
router.delete("/:id", async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

export default router;
