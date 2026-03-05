const queueService = require('../services/queueService');
const { generateTicketPDF } = require('../utils/pdfGenerator');

/**
 * POST /api/queue
 * Create a new queue entry and return it.
 */
const createQueue = async (req, res) => {
    try {
        const queue = await queueService.createQueue();

        // Emit socket event to all connected clients
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
        console.error('Error creating queue:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create queue',
            error: error.message,
        });
    }
};

/**
 * GET /api/queue
 * Get all queue entries.
 */
const getAllQueues = async (req, res) => {
    try {
        const queues = await queueService.getAllQueues();

        return res.status(200).json({
            success: true,
            data: queues,
        });
    } catch (error) {
        console.error('Error fetching queues:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch queues',
            error: error.message,
        });
    }
};

/**
 * PATCH /api/queue/:id
 * Update queue status.
 */
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

        // Emit socket event to all connected clients
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
        console.error('Error updating queue:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update queue',
            error: error.message,
        });
    }
};

/**
 * GET /api/queue/latest
 * Get the latest queue number.
 */
const getLatestQueueNumber = async (req, res) => {
    try {
        const queueNumber = await queueService.getLatestQueueNumber();

        return res.status(200).json({
            success: true,
            data: { queueNumber },
        });
    } catch (error) {
        console.error('Error fetching latest queue:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch latest queue number',
            error: error.message,
        });
    }
};

/**
 * GET /api/queue/:id/ticket
 * Download PDF ticket for a queue entry.
 */
const downloadTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const Queue = require('../models/Queue');
        const queue = await Queue.findById(id);

        if (!queue) {
            return res.status(404).json({
                success: false,
                message: 'Queue not found',
            });
        }

        generateTicketPDF(queue, res);
    } catch (error) {
        console.error('Error generating ticket:', error);
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
