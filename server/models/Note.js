const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        min:36,
        max: 36
    },
    libraryId: {
        type: String,
        required: true,
        min:36,
        max: 36
    },
    bookId: {
        type: String,
        required: true,
        min:36,
        max: 36
    },
    note: {
        type: Object,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Note', noteSchema);