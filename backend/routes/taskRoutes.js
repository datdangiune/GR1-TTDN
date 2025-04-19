const express = require('express');
const { createTask, getTaskById, getAllTasks, updateTaskStatus } = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Ensure correct import

const router = express.Router();

router.post('/', authMiddleware, createTask);
router.get('/:id', authMiddleware, getTaskById);
router.get('/', authMiddleware, getAllTasks);
router.put('/:id/status', authMiddleware, updateTaskStatus);

module.exports = router;
