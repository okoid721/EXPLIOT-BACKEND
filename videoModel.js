const mongoose = require('mongoose');

// Define schema for videos
const videoSchema = new mongoose.Schema({
  videoPath: { type: String, required: true },
  caption: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
});

// Create model from schema
const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
