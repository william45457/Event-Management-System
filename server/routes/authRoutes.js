const express = require('express');
const { register, login, forgotPassword, resetPassword, getUsers, toggleBlockUser, updateUserRole, getAuditLogs } = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// User Management & System Logs (Admin Only)
router.get('/users', protect, restrictTo('Admin'), getUsers);
router.put('/users/:id/block', protect, restrictTo('Admin'), toggleBlockUser);
router.put('/users/:id/role', protect, restrictTo('Admin'), updateUserRole);
router.get('/audit-logs', protect, restrictTo('Admin'), getAuditLogs);

module.exports = router;
