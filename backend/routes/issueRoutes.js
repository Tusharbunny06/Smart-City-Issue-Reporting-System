const express = require('express');
const router = express.Router();
const { 
    createIssue, 
    getIssues, 
    getIssueById, 
    updateStatus, 
    assignWorker 
} = require('../controllers/issueController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
    .get(protect, getIssues)
    .post(protect, authorize('citizen'), upload.single('image'), createIssue);

router.route('/:id')
    .get(protect, getIssueById);

router.put('/:id/status', protect, authorize('worker', 'admin'), updateStatus);
router.put('/:id/assign', protect, authorize('admin'), assignWorker);

module.exports = router;
