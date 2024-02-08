const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/my-blog-db', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));


// Define Mongoose Model
const BlogPost = mongoose.model('BlogPost', {
    title: String,
    body: String,
    author: String,
    timestamps: { type: Date, default: Date.now }
});

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// Middleware for Data Validation
const validateBlogPost = (req, res, next) => {
    const { title, body } = req.body;
    if (!title || !body) {
        return res.status(400).json({ error: 'Title and body are required' });
    }
    next();
};

// Apply validation middleware to relevant routes
app.post('/blogs', validateBlogPost);
app.put('/blogs/:id', validateBlogPost);


// API Endpoints
app.post('/blogs', async (req, res, next) => {
    try {
        const { title, body, author } = req.body;

        // Validate data (not needed here if you're using the middleware)

        const newPost = new BlogPost({ title, body, author });
        await newPost.save();

        res.status(201).json(newPost);
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware
    }
});


app.get('/blogs', async (req, res) => {
    try {
        const posts = await BlogPost.find();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/blogs/:id', async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/blogs/:id', async (req, res, next) => {
    try {
        const updatedPost = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(200).json(updatedPost);
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware
    }
});

app.delete('/blogs/:id', async (req, res, next) => {
    try {
        const deletedPost = await BlogPost.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(204).send();
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
