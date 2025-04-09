const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

// Import the Video model
const Video = require('./videoModel');

// Initialize the app
const app = express();
const port = 5000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up multer disk storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Route to handle video upload with caption
app.post('/upload-video', upload.single('video'), (req, res) => {
  const { caption } = req.body;

  if (!req.file) {
    return res.status(400).send({ message: 'No video file uploaded.' });
  }

  if (!caption) {
    return res.status(400).send({ message: 'No caption provided.' });
  }

  const newVideo = new Video({
    videoPath: req.file.path.replace(/\\/g, '/'), // Ensure forward slashes
    caption: caption
  });

  newVideo.save()
    .then(() => {
      res.status(200).send({
        message: 'Video uploaded successfully!',
        videoData: newVideo
      });
    })
    .catch(err => {
      res.status(500).send({ message: 'Failed to save video data.', error: err });
    });
});

// Route to get all videos
app.get('/videos', (req, res) => {
  Video.find()
    .then(videos => {
      res.status(200).send({
        message: 'Videos retrieved successfully.',
        videos: videos
      });
    })
    .catch(err => {
      res.status(500).send({ message: 'Failed to retrieve videos.', error: err });
    });
});

// Route to delete a video by id
app.delete('/videos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the video by ID
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).send({ message: 'Video not found.' });
    }

    // Delete the video file from the server
    const videoPath = path.join(__dirname, video.videoPath);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath); // Remove the file
    }

    // Delete the video document from the database
    await Video.findByIdAndDelete(id);

    res.status(200).send({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Failed to delete video.', error: error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
