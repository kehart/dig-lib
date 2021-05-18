const uri = process.env.MONGO_CXN_URI;
const mongoose = require('mongoose');
const Note = require('../models/Note');


// Connect to DB
mongoose.connect(
    uri, {useNewUrlParser: true}, () => {
        console.log('Connected to MongoDB')
    }
);

let db = {}
db.createNote = async(userId, bookId, libraryId, note) => {
    const noteObj = new Note({
        userId: userId,
        libraryId: libraryId,
        bookId: bookId,
        note: note
    });
    await noteObj.save((err) => {
        if (err) console.log(err)
    });
}


module.exports = db;