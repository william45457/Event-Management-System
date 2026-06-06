const AuditLog = require('../models/AuditLog');

const logAudit = async (action, userId, details, ipAddress = '') => {
    try {
        await AuditLog.create({
            action,
            performedBy: userId || null,
            details,
            ipAddress
        });
    } catch (err) {
        console.error('Failed to save audit log:', err.message);
    }
};

module.exports = { logAudit };
