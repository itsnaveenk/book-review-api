const Book = require('../models/Book');
const Review = require('../models/Review');

exports.addBook = async (req, res) => {
  try {
    const { title, author, genre, description } = req.body;
    if (!title || !author) {
      return res.status(400).json({ message: 'Title and author are required' });
    }
    const book = new Book({ title, author, genre, description });
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, author, genre } = req.query;
    const filter = {};
    if (author) filter.author = author;
    if (genre) filter.genre = genre;
    const books = await Book.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Book.countDocuments(filter);
    res.json({
      books,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 5 } = req.query;
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    const reviews = await Review.find({ book: id })
      .populate('user', 'username')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const totalReviews = await Review.countDocuments({ book: id });
    const avgResult = await Review.aggregate([
      { $match: { book: book._id } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const averageRating = avgResult[0]?.avgRating || null;
    res.json({
      book,
      averageRating,
      reviews,
      totalReviews,
      page: Number(page),
      pages: Math.ceil(totalReviews / limit)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query parameter q is required' });
    const regex = new RegExp(q, 'i');
    const books = await Book.find({
      $or: [
        { title: regex },
        { author: regex }
      ]
    });
    res.json({ books });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
