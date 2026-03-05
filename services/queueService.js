const { getConnectionStatus } = require('../config/db');

let memQueues = [];
let memCounter = 0;
let memIdCounter = 1;

function generateId() {
    return String(memIdCounter++);
}

const mongoService = {
    async createQueue() {
        const Counter = require('../models/Counter');
        const Queue = require('../models/Queue');

        const counter = await Counter.findOneAndUpdate(
            { name: 'queue' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const queueNumber = `A${String(counter.seq).padStart(3, '0')}`;
        const queue = new Queue({ queueNumber, number: counter.seq });
        await queue.save();
        return queue;
    },

    async getAllQueues() {
        const Queue = require('../models/Queue');
        return await Queue.find().sort({ number: 1 });
    },

    async updateQueueStatus(id, status) {
        const Queue = require('../models/Queue');
        const queue = await Queue.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        if (!queue) throw new Error('Queue not found');
        return queue;
    },

    async getLatestQueueNumber() {
        const Queue = require('../models/Queue');
        const latest = await Queue.findOne().sort({ number: -1 });
        return latest ? latest.queueNumber : null;
    },

    async getQueueById(id) {
        const Queue = require('../models/Queue');
        return await Queue.findById(id);
    },
};

const memService = {
    async createQueue() {
        memCounter++;
        const queueNumber = `A${String(memCounter).padStart(3, '0')}`;
        const queue = {
            _id: generateId(),
            queueNumber,
            number: memCounter,
            status: 'waiting',
            createdAt: new Date(),
        };
        memQueues.push(queue);
        return queue;
    },

    async getAllQueues() {
        return [...memQueues].sort((a, b) => a.number - b.number);
    },

    async updateQueueStatus(id, status) {
        const queue = memQueues.find((q) => q._id === id);
        if (!queue) throw new Error('Queue not found');
        queue.status = status;
        return queue;
    },

    async getLatestQueueNumber() {
        if (memQueues.length === 0) return null;
        const latest = [...memQueues].sort((a, b) => b.number - a.number)[0];
        return latest.queueNumber;
    },

    async getQueueById(id) {
        return memQueues.find((q) => q._id === id);
    },
};

function getService() {
    return getConnectionStatus() ? mongoService : memService;
}

module.exports = {
    createQueue: (...args) => getService().createQueue(...args),
    getAllQueues: (...args) => getService().getAllQueues(...args),
    updateQueueStatus: (...args) => getService().updateQueueStatus(...args),
    getLatestQueueNumber: (...args) => getService().getLatestQueueNumber(...args),
    getQueueById: (...args) => getService().getQueueById(...args),
};
