const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/User");
const Post = require("./models/Post");
const Comment = require("./models/Comment");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));


// ================= DATABASE =================
mongoose.connect("mongodb+srv://laibaishtiaq372_db_user:Uku6nrM8B7BTJwbM@cluster0.zj62g9p.mongodb.net/?appName=Cluster0")
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => console.log("Database Error:", err));

// ================= USERS =================

// Get all users
app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create user
app.post("/api/users", async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            username: req.body.username,
            bio: req.body.bio
        });

        await user.save();

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ================= POSTS =================

// Get all posts
app.get("/api/posts", async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create post
app.post("/api/posts", async (req, res) => {
    try {
        const post = new Post({
            username: req.body.username,
            text: req.body.text
        });

        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Like / Unlike post
app.put("/api/posts/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        post.likes++;

        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ================= COMMENTS =================

// Get comments
app.get("/api/comments/:postId", async (req, res) => {
    try {
        const comments = await Comment.find({
            postId: req.params.postId
        });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add comment
app.post("/api/comments", async (req, res) => {
    try {
        const comment = new Comment({
            postId: req.body.postId,
            username: req.body.username,
            text: req.body.text
        });

        await comment.save();

        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ================= FOLLOW =================

app.put("/api/users/:id/follow", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        user.followers++;

        await user.save();

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ================= SERVER =================
app.get("/create-user", async (req, res) => {

    const user = new User({
        name: "Laiba",
        username: "laiba",
        bio: "Software Engineering Student"
    });

    await user.save();

    res.send("User created successfully!");
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});