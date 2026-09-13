const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const Project = require("./models/Project");
const Task = require("./models/Task");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Database Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/project_db")
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

// --- PROJECT ROUTES ---

// Create Project
app.post("/api/projects", async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Projects
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TASK ROUTES ---

// Create Task
app.post("/api/tasks", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Tasks by Project ID
app.get("/api/tasks/:projectId", async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Task Status
app.put("/api/tasks/:id/status", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Comment to Task
app.post("/api/tasks/:id/comments", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    task.comments.push({ text: req.body.text });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));