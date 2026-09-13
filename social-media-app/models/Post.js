const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },

    text: {
        type: String,
        required: true
    },

    likes: {
        type: Number,
        default: 0
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Post", postSchema);