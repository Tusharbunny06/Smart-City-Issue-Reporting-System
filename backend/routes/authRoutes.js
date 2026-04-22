const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getWorkers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/workers', protect, authorize('admin'), getWorkers);

module.exports = router;
