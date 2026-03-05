const queueService = require('../services/queueService');
const { generateTicketPDF } = require('../utils/pdfGenerator');

const createQueue = async (req, res) => {
    try {
        const queue = await queueService.createQueue();

        const io = req.app.get('io');
        if (io) {
            io.emit('queue_created', {
                queueNumber: queue.queueNumber,
                queue: queue,
            });
        }

        return res.status(201).json({
            success: true,
            data: queue,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to create queue',
            error: error.message,
        });
    }
};

const getAllQueues = async (req, res) => {
    try {
        const queues = await queueService.getAllQueues();

        return res.status(200).json({
            success: true,
            data: queues,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch queues',
            error: error.message,
        });
    }
};

const updateQueueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['waiting', 'processed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be "waiting" or "processed".',
            });
        }

        const queue = await queueService.updateQueueStatus(id, status);

        const io = req.app.get('io');
        if (io) {
            io.emit('queue_updated', {
                queue: queue,
            });
        }

        return res.status(200).json({
            success: true,
            data: queue,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update queue',
            error: error.message,
        });
    }
};

const getLatestQueueNumber = async (req, res) => {
    try {
        const queueNumber = await queueService.getLatestQueueNumber();

        return res.status(200).json({
            success: true,
            data: { queueNumber },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch latest queue number',
            error: error.message,
        });
    }
};

const downloadTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const queue = await queueService.getQueueById(id);

        if (!queue) {
            return res.status(404).json({
                success: false,
                message: 'Queue not found',
            });
        }

        generateTicketPDF(queue, res);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to generate ticket',
            error: error.message,
        });
    }
};

module.exports = {
    createQueue,
    getAllQueues,
    updateQueueStatus,
    getLatestQueueNumber,
    downloadTicket,
};
