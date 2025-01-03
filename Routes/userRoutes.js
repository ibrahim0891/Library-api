

const express = require('express');
const userRouter = express.Router();

const { Book, User, Copies, Reserve } = require('../Database/models');


//User UserRouter 

userRouter.get('/user/all', async function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
        .skip(skip)
        .limit(limit);
        
    const total = await User.countDocuments();
    
    res.send({
        users,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total
    });
});


//search for user by name with partial match
userRouter.get('/user/search', async function (req, res) {
    const users = await User.find({ name: { $regex: req.query.name, $options: 'i' } });
    res.send(users);
}); 

//search user by email 
userRouter.get('/user/:id', async function (req, res) {
    const user = await User.find({ email: req.params.email });
    res.send(user);
});

userRouter.get('/user', async function (req, res) {
    if (!req.query.id) {
        return res.status(400).send({ message: 'User ID is required' });
    }
    const user = await User.findById(req.query.id).populate({
        path: 'reservedBooks',
        model: 'Reserve',
        populate: {
            path: 'bookID',
            model: 'Book'
        }
    }).populate({
        path: 'borrowedBooks',
        model: 'Copies',
        populate: {
            path: 'bookId',
            model: 'Book'
        }
    }); 
    res.send(user);
}); 


userRouter.post('/user', async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).send({ message: 'User already exists' });
        }

        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });
        res.status(201).send(user);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

userRouter.put('/user') //this is not seems to be required as we are not updating user details

userRouter.delete('/user', async function (req, res) {
    const user = await User.findByIdAndDelete(req.params.id);
    const reserve = await Reserve.deleteMany({ userID: req.params.id });
    const copies = await Copies.find({ borrowedBy: req.params.id });
    copies.forEach(async (copy) => {
        copy.status = 'available';
        copy.borrowedBy = null;
        await copy.save();
    });
    res.send(user);
    res.send(reserve);
    res.send(copies);
});

userRouter.post('/user/login', async (req, res) => {
    const createToken = Math.random().toString(36).substring(2) + Date.now().toString(36)
        try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).send({ message: 'User not found' });
        }
        if (user.password !== req.body.password) {
            return res.status(400).send({ message: 'Invalid password' });
        }
        user.token = createToken;
        await user.save();
        res.send(user);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});
 
// get all reservation 
userRouter.get('/reservations', async (req, res) => {
    const user = await User.findById(req.query.id);
    // const user = '676bab14a62f85c8802cd176'
    const reserves = await Reserve.find({ userID: user }).populate('bookID');

    res.send(reserves);
})

    

module.exports = userRouter;