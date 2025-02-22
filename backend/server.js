require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { connectDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); // Serve uploaded images

// Connect to MongoDB
connectDB();

// Define Item Schema
const itemSchema = new mongoose.Schema({
    reportType: { type: String, required: true },
    articleType: { type: String, required: true },
    lostFoundDate: { type: Date, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: false },
    date: { type: Date, default: Date.now },
});

const Item = mongoose.model('Item', itemSchema);

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); // Save files to public/uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
    }
});

// File filter for image uploads
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, JPG, PNG, GIF) are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});

// API endpoint to add a new item
app.post('/api/items', upload.single('itemImage'), async (req, res) => {
    try {
        const newItem = new Item({
            reportType: req.body.reportType,
            articleType: req.body.articleType,
            lostFoundDate: req.body.lostFoundDate,
            location: req.body.location,
            description: req.body.description,
            imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        console.error('❌ Error adding item:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// API endpoint to get all items
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).json(items);
    } catch (err) {
        console.error('❌ Error fetching items:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// API endpoint to get a specific item
app.get('/api/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json(item);
    } catch (err) {
        console.error('❌ Error fetching item:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// API endpoint to delete an item
app.delete('/api/items/:id', async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (err) {
        console.error('❌ Error deleting item:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
