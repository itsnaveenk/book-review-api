const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');

router.post('/', auth, bookController.addBook);
router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBookById);
router.get('/search', bookController.searchBooks);

const reviewController = require('../controllers/reviewController');
router.post('/:id/reviews', auth, reviewController.addReviewToBook);

module.exports = router;
