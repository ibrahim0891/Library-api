
//dependencies
const express = require('express');
const { mongoose } = require('mongoose');
const cron = require('node-cron');
const { Reserve, Book } = require('./Database/models');
const cors = require('cors');


//initialize express and mongoose
const app = express();
mongoose.connect('mongodb://localhost:27017/library').then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log(err);
});

//middleware
app.use(express.json()); 
app.use(cors());


//Book Router
app.use('/', require('./Routes/bookRoutes'))

//user Router
app.use('/', require('./Routes/userRoutes'))

//utilities Router
app.use('/', require('./Utilities/bookUtilities'))

//copies Router
app.use('/', require('./Routes/copiesRouter'))

//cron job to check for expired reservations
cron.schedule('0 0 */3 * * *', async () => {        console.log("Checking for expired reservations");
    const books = await Book.find()
    books.forEach((book) => {
        book.reserverList.forEach(async (reserveID) => {
            const reserve = await Reserve.findById(reserveID);
            if (reserve.expire < Date.now()) {
                book.reserverList.pull(reserve._id);
                await book.save();
                await Reserve.findByIdAndDelete(reserve._id);
                console.log("Reservation expired"); 
            }
        })
    }) 
});



//start server
app.listen(3000, function () {
    console.log("Server started on port 3000");
});