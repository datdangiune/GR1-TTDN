const express = require('express');
const { getHistory, addHistory, searchHistory, exportHistoryCSV } = require('../controllers/historyController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Ensure correct import

const router = express.Router();

router.get('/', authMiddleware, getHistory);
router.post('/', authMiddleware, addHistory);
router.get('/search', authMiddleware, searchHistory);
router.get('/export', authMiddleware, exportHistoryCSV);

module.exports = router;
