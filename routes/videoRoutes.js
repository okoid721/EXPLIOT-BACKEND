// routes/videoRoutes.js
const express = require('express');
const multer = require('multer');
const Video = require('../models/Video');
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage });

router.post('/', upload.single('video'), async (req, res) => {
    const video = new Video({
        title: req.body.title,
        url: req.file.path,
    });

    try {
        await video.save();
        res.status(201).send(video);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/', async (req, res) => {
    try {
        const videos = await Video.find();
        res.status(200).send(videos);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;