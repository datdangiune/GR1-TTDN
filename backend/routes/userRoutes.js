const express = require('express');
const { getUser, updateUser, uploadAvatar, updateProfile, getStatistics } = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, getUser);
router.put('/', authMiddleware, updateUser);
router.post('/avatar', authMiddleware, uploadAvatar);
router.put('/profile', authMiddleware, updateProfile);
router.get('/statistics', authMiddleware, adminMiddleware, getStatistics);

module.exports = router;
