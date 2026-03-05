const express = require('express');
const router = express.Router();
const {
    createQueue,
    getAllQueues,
    updateQueueStatus,
    getLatestQueueNumber,
    downloadTicket,
} = require('../controllers/queueController');

router.post('/', createQueue);
router.get('/', getAllQueues);
router.get('/latest', getLatestQueueNumber);
router.patch('/:id', updateQueueStatus);
router.get('/:id/ticket', downloadTicket);

module.exports = router;
