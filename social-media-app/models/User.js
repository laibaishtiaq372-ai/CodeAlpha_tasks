const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true
    },

    bio: {
        type: String,
        default: ""
    },

    followers: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("User", userSchema);