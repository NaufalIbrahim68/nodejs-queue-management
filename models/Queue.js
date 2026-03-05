const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
    queueNumber: {
        type: String,
        required: true,
        unique: true,
    },
    number: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['waiting', 'processed'],
        default: 'waiting',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Queue', queueSchema);
