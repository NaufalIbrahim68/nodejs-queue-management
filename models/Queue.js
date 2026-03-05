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
        index: true,
    },
    status: {
        type: String,
        enum: ['waiting', 'processed'],
        default: 'waiting',
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

queueSchema.index({ status: 1, number: 1 });

module.exports = mongoose.model('Queue', queueSchema);
