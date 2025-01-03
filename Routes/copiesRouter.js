


const express = require('express');

const copiesRouter = express.Router();

const { Copies } = require('../Database/models');

//Copies Router

copiesRouter.get('/copies', async function (req, res) {
    const bookId = '67690c0a7c80d8d27268604b'
    const copies = await Copies.find({ bookId: bookId });
    res.send(copies);
})

//add new copy 
copiesRouter.post('/copies', async function (req, res) {
    const bookId = req.body.bookId; //it will ba a mongodb object id 
    const copy = new Copies({
        status: 'available',
        borrowedBy: null,
        bookId: bookId,
    });
    const savedCopy = await copy.save();
    res.send(savedCopy);
})

//update copy
copiesRouter.put('/copies', async function (req, res) {
    const copyId = req.body.copyId;
    // const copyId = '67690c0a7c80d8d272686045' 
    const updateCopy = {
        status: 'unavailable',
        condition: 'poor',
    }
    const updatedCopy = await Copies.findByIdAndUpdate(copyId, updateCopy, { new: true });
    res.send(updatedCopy);
})

//delete copy
copiesRouter.delete('/copies', async function (req, res) {
    const copyId = req.body.copyId;
    // const copyId = '67690c0a7c80d8d272686045'
    const deletedCopy = await Copies.findByIdAndDelete(copyId);
    Book.updateOne({ copies: { $in: copyId } }, { $pull: { copies: copyId } });
    res.send(deletedCopy);
});

module.exports = copiesRouter;