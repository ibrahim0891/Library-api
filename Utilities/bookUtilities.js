
//dependencies
const express = require('express');
const { User, Book, Copies, Reserve } = require('../Database/models');

const utilities = express.Router();

utilities.post('/issueBook', async (req, res) => {
    // const bookId = '67690c0a7c80d8d27268604b'; 
    // const userID = '676986e7aedcaacb246558ba'; 
    const bookId = req.body.bookID;
    const userID = req.body.userID;
    console.log(bookId, userID);

    //fetch user data and check if user exists
    const user = await User.findById(userID);
    if (!user) {
        res.status(404).send({message: 'User not found'});
        return;
    }
    //fetch book data and check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
        res.status(404).send({message: 'Book not found'});
        return;
    }

    //check if user has borrowed more than 3 books
    if (user.borrowedBooks.length >= 3) {
        res.status(400).send({ message: 'User has already borrowed 3 books' });
        return;
    }

    //check if book is already borrowed

    if (book.borrowedBy.includes(userID)) {
        res.status(400).send({ message: 'Book is already borrowed' });
        return;
    }

    const copies = await Copies.find({ bookId: bookId, status: 'available' });
    if (copies.length === 0) {
        res.status(400).send({ message: 'Book is not available' });
        return;
    }

    const copy = copies[0]; //grab the first available copy
    // copy.status = 'borrowed';
    // copy.borrowedBy = userID;

    copy.updateOne({ status: 'borrowed', borrowedBy: userID, dueDate: copy.dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }).then(result => {
        console.log(result);
    }).catch(err => {
        console.log(err);
    });

    user.borrowedBooks.push(copy._id);
    book.borrowedBy.push(userID);

    const reserve = await Reserve.findOneAndDelete({ userID: userID, bookID: bookId })
    user.reservedBooks = user.reservedBooks.filter(reservation => reservation.toString() !== reserve._id.toString());
    if (reserve) {
        book.reserverList = book.reserverList.filter(reservation => reservation.toString() !== reserve._id.toString());
    }
    // await reserve.save();
    // await copy.save();
    await user.save();
    await book.save();
    res.send({ message: 'Book borrowed successfully' });

})

utilities.post('/reserveBook', async (req, res) => {
    // const bookId = '67690c0a7c80d8d27268604b';
    // const userID = '676986e7aedcaacb246558ba'; 
    const bookId = req.body.bookId;
    const userID = req.body.userId;

    const book = await Book.findById(bookId);
    const user = await User.findById(userID);

    //incase book or user not found
    if (!book || !user) {
        res.status(404).send('Book or user not found');
        return;
    }

    //check if book is already borrwed
    if (book.borrowedBy.includes(userID)) {
        res.status(400).send('Book is already borrowed');
        return;
    }
    //check if book is already reserved
    if (book.reserverList.includes(userID)) {
        res.status(400).send('Book is already reserved');
        return;
    }

    //check if user has already borrowed 3 books
    if (user.borrowedBooks.length >= 3) {
        res.status(400).send('User has already borrowed 3 books');
        return;
    }


    //check if user has already reserved 3 books
    if (user.reservedBooks.length >= 3) {
        res.status(400).send({message:'User has already reserved 3 books'});
        return;
    }
    const reservationExist = await Reserve.findOne({ userID: userID, bookID: bookId });

    if (reservationExist) {
        res.status(400).send('Book is already reserved');
        return;
    }

    const reserve = new Reserve({
        userID: userID,
        bookID: bookId
    });
    user.reservedBooks.push(reserve._id);
    book.reserverList.push(reserve._id);
    await user.save();
    await reserve.save();
    await book.save();
    res.send('Book reserved successfully');
})

utilities.post('/cancelReservation', async (req, res) => {
    // const bookId = '67690c0a7c80d8d27268604b';
    // const userID = '676986e7aedcaacb246558ba';
    const bookId = req.body.bookId;
    const userID = req.body.userId;

    const book = await Book.findById(bookId);
    const user = await User.findById(userID);

    //incase book or user not found 
    if (!book || !user) {
        res.status(404).send('Book or user not found');
        return;
    }

    const findReserve = await Reserve.findOne({ userID: userID, bookID: bookId });
    if (!findReserve) {
        res.status(400).send('Reservation not found');
        return;
    }
    //remove reservation from book's reserverList
    user.reservedBooks = user.reservedBooks.filter(reservation => reservation._id.toString() !== findReserve._id.toString());
    book.reserverList = book.reserverList.filter(reservation => reservation._id.toString() !== findReserve._id.toString());
    await book.save();
    await user.save();
    await Reserve.findByIdAndDelete(findReserve._id);
    res.send('Reservation cancelled successfully');
});

utilities.post('/returnBook', async (req, res) => {
    // const bookId = '67690c0a7c80d8d27268604b';
    // const userID = '676986e7aedcaacb246558ba';

    const bookId = req.body.bookID;
    const userID = req.body.userID;

    const book = await Book.findById(bookId);
    const user = await User.findById(userID);
    const copy = await Copies.findOne({ bookId: bookId, borrowedBy: userID });

    console.log(copy);
    //incase book or user not found
    if (!book || !user) {
        res.status(404).send({ message: 'Book or user not found' });
        return;
    }

    //check if user already returned the book 
    if (!copy) {
        res.status(400).send({message: 'User has not borrowed the book'});
        return;
    }

    //remove book copy from user's borrowedBooks array 
    user.borrowedBooks = user.borrowedBooks.filter(copyId => copyId.toString() !== copy._id.toString());

    //remove user from book's borrowedBy array
    book.borrowedBy = book.borrowedBy.filter(userId => userId.toString() !== userID);

    //find the copy of the book that the user has borrowed
    if (!copy) {
        res.status(404).send('Copy not found');
        return;
    }
    //update the status of the copy to available
    copy.status = 'available';
    copy.borrowedBy = null;
    copy.dueDate = null;
    await copy.save();
    await user.save();
    await book.save();
    res.send({ message: 'Book returned successfully' });
})



module.exports = utilities;