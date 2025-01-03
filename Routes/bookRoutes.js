


const express = require('express');
const router = express.Router();
const { Book, User, Copies, Reserve } = require('../Database/models');

router.get('/statistics', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments()
        const totalBooks = await Book.countDocuments()

        const bookStats = await Book.aggregate([
            {
                $project: {
                    borrowedCopiesCount: { $size: "$borrowedBy" },
                    reservedCopiesCount: { $size: "$reserverList" },
                    totalCopies: { $size: "$copies" },
                    title: 1
                }
            }
        ])

        console.log(bookStats)
        const totalBorrowedBooks = bookStats.reduce((acc, book) => acc + book.borrowedCopiesCount, 0)
        const totalReservedBooks = bookStats.reduce((acc, book) => acc + book.reservedCopiesCount, 0)
        const totalCopies = bookStats.reduce((acc, book) => acc + book.totalCopies, 0)
        const totalAvailableCopies = totalCopies - totalBorrowedBooks - totalReservedBooks

        const mostBorrowedBooks = await Book.aggregate([
            {
                $project: {
                    title: 1,
                    borrowCount: { $size: "$borrowedBy" }
                }
            },
            { $sort: { borrowCount: -1 } },
            { $limit: 5 }
        ])

        res.json({
            totalUsers,
            totalBooks,
            totalBorrowedBooks,
            totalReservedBooks,
            totalCopies,
            totalAvailableCopies,
            totalBorrowedCopies: totalBorrowedBooks,
            totalReservedCopies: totalReservedBooks,
            mostBorrowedBooks
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

//make a endpoint to get all resservation and send the books with the reservation data
router.get('/reservations', async (
    req, res
) => {
    try {
        const reservations = await Reserve.find()
            .populate('userID')
            .populate('bookID')
        res.send(reservations)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
});

router.get('/book/details', async (req, res) => {
    try {
        const bookId = req.query.id;
        const bookDetails = await Book.findById(bookId)
            .populate({
                path: 'copies',
                select: 'copyNumber status condition purchaseDate'
            })
            .populate({
                path: 'borrowedBy',
                select: 'name email'
            })
            .populate({
                path: 'reserverList',
                populate: {
                    path: 'userID',
                    model: 'User',
                    select: 'name email'
                }
            });

        if (!bookDetails) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const response = {
            ...bookDetails.toObject(),
            totalCopies: bookDetails.copies.length,
            availableCopies: bookDetails.copies.filter(copy => copy.status === 'available').length,
            borrowedCopies: bookDetails.borrowedBy.length,
            reservedCopies: bookDetails.reserverList.length
        };
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/books', async function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find()
        .skip(skip)
        .limit(limit);

    const total = await Book.countDocuments();

    res.send({
        books,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBooks: total
    });
});

router.get('/book', async function (req, res) {
    const bookId = req.query.id;
    const book = await Book.findById(bookId)
        .populate('copies')
        .populate('borrowedBy')
        .populate({
            path: 'reserverList',
            populate: {
                path: 'userID',
                model: 'User'
            }
        })
    res.send(book);
});

//seach for book by any field with partial match
router.get('/books/search', async function (req, res) {
    const { searchField, searchValue } = req.query;
    if (!searchField || !searchValue) {
        return res.status(400).send('Missing search field or value');
    }
    console.log(searchField, searchValue);
    const searchQuery = { [searchField]: { $regex: searchValue, $options: 'i' } };
    // const searchQuery = { title: { $regex: searchValue, $options: 'i' } };
    const books = await Book.find(searchQuery);
    console.log(books);
    res.send(books);
});


router.post('/books', async function (req, res) {

    const bookData = req.body;
    // const bookData = {
    //     title: 'Pride and Prejudice',
    //     author: 'Jane Austen',
    //     reserverList: [],
    //     borrowedBy: [],
    //     copies: [],
    //     numCopies: 3,
    // }

    const copiesIds = [];
    const numCopies = bookData.numCopies;

    for (let i = 0; i < numCopies; i++) {
        const copy = new Copies({
            status: 'available',
            borrowedBy: null,
        });
        const savedCopy = await copy.save();
        copiesIds.push(savedCopy._id);
    }

    bookData.copies = copiesIds;
    const book = new Book(bookData);
    const savedBook = await book.save();

    await Copies.updateMany(
        { _id: { $in: copiesIds } },
        { bookId: savedBook._id }
    );

    res.send(savedBook);
});


router.put('/books', async function (req, res) {
    const updatedBookData = req.body;
    // const updatedBookData = {
    //     title: 'To Kill a Mockingbird',
    //     author: 'Harper Lee',
    // }
    const bookId = '6768fd07a35c3aeb0e1d6692'; // later will be req.params.id
    const book = await Book.findById(bookId);
    book.title = updatedBookData.title;
    book.author = updatedBookData.author;

    await Book.updateOne({ _id: bookId }, book);
    res.send(book);

});


router.delete('/books', async function (req, res) {
    //later will be req.params.id
    const bookId = req.body.bookId;
    // const bookId = '67690bac35433bc2458882e4';
    try {
        const bookExists = await Book.findById(bookId);
        if (!bookExists) {
            return res.status(404).send("Book not found");
        }

        await Book.deleteOne({ _id: bookId });
        await Copies.deleteMany({ bookId: bookId });
        res.status(200).send("Book and associated copies deleted successfully");
    } catch (error) {
        console.error("Error deleting book:", error);
        res.status(500).send("Error occurred while deleting the book");
    }
});

module.exports = router;