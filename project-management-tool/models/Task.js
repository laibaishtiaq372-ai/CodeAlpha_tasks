const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const TaskSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  title: { type: String, required: true },
  assignedTo: String,
  status: { type: String, enum: ["Todo", "In Progress", "Done"], default: "Todo" },
  comments: [CommentSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Task", TaskSchema);