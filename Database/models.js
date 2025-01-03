


const mongoose = require('mongoose');
 
const reserverSchema = new mongoose.Schema({
    userID : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookID : { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    reservationDate: {
        type: Date,
        default: Date.now()
    }, 
    expire: {
        type: Date,
        default: Date.now() + 3 * 24 * 60 * 60 * 1000
    } //3 days
})
 

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: [String], // To categorize books
    publicationYear: { type: Number },
    ISBN: { type: String, unique: true, required: true }, // For unique identification
    reserverList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reserve'
    }],
    borrowedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    copies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Copies' }],
    summary: { type: String }, // Brief description of the book
    language: { type: String, default: 'English' },
    rating: { type: Number, min: 0, max: 5 }, // Average rating by users
    tags: [String], // Additional tags for easy search
    createdAt: { type: Date, default: Date.now }, // Date of entry into the library
    updatedAt: { type: Date, default: Date.now }
});


// const userSchema = new mongoose.Schema({
//     name: String,
//     password: String,
//     email: {
//         type: String,
//         unique: true
//     },
//     borrowedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Copies' }],
// })

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: {
        type: String,
        unique: true,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user' // Differentiate between normal users and administrators
    },
    borrowedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Copies' }],
    reservedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reserve' }],
    finesDue: { type: Number, default: 0 }, // Penalties for late returns
    address: { type: String },
    phoneNumber: { type: String },
    membershipDate: { type: Date, default: Date.now }, // When they joined the library
    isActive: { type: Boolean, default: true }, // Track if a user account is active
    token: { type: String },
});




const copiesSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    status: {
        type: String,
        enum: ['available', 'borrowed', 'reserved', 'damaged'],
        default: 'available'
    },
    condition: {
        type: String,
        enum: ['good', 'fair', 'poor'],
        default: 'good'
    },
    borrowedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    borrowDate: { type: Date }, // When the book was borrowed
    dueDate: { type: Date }, // Expected return date
    returnDate: { type: Date }, // Actual return date
    addedToLibrary: { type: Date, default: Date.now }, // When the copy was added to the library
});


const copies = new mongoose.Schema({
    bookId: String,
    status: {
        type: String,
        enum: ['available', 'borrowed'],
        default: 'available'
    },
    condition: {
        type: String,
        enum: ['good', 'fair', 'poor'],
        default: 'good'
    }, 
    borrowedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    borrowDate: { type: Date }, // When the book was borrowed
    dueDate: { type: Date }, // Expected return date
})


const models = {}

models.Book = mongoose.model('Book', bookSchema);
models.User = mongoose.model('User', userSchema);
models.Copies = mongoose.model('Copies', copies); 
models.Reserve = mongoose.model('Reserve', reserverSchema); 



module.exports = models;