

const express = require('express');

const reviewRouter = express.Router();

const { Review } = require('../Database/models');

//Review Router

reviewRouter.post('/review', async function (req, res) {
    const userId = req.body.userId; 
    const bookId = req.body.bookId;
    const reviewText = req.body.reviewText;
    const rating = req.body.rating;

    const review = new Review({
        userId: userId,
        bookId: bookId,
        reviewText: reviewText,
        rating: rating,
    });

    const savedReview = await review.save();
    res.send(savedReview);
})

//get all review of a book 

reviewRouter.get('/review/:bookId', async function (req, res) {
    const bookId = req.params.bookId;
    const reviews = await Review.find({ bookId: bookId });
    res.send(reviews);
})

//delete review by _id 
reviewRouter.delete('/review/:reviewId', async function (req, res) {
    const reviewId = req.params.reviewId;
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    res.send(deletedReview);
})