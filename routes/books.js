const express = require('express');
const router = express.Router();
const Book = require('../models/book'); 

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific book by ID
router.post('/', async (req, res) => {
    try {
      const { title, author, price, description, imageURL } = req.body;
      const newBook = new Book({title, author, price, description, imageURL });
      await newBook.save();
      res.status(201).json(newBook);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

// Add a new book
router.post('/', async (req, res) => {
  try {
    const { title, author, price, description, imageURL } = req.body;
    const newBook = new Book({ title, author, price, description, imageURL });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a book by ID
router.put('/:id', async (req, res) => {
  try {
    const { title, price } = req.body;
    if (!title || !price) {
      return res.status(400).json({ error: 'Title and price are required' });
    }
  
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { title, price },
      { new: true }
    );
  
    if (!updatedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }
  
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a book by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

