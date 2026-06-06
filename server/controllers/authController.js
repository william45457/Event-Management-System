const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { logAudit } = require('../middleware/auditLogger');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'User'
        });

        // Log audit
        await logAudit('USER_REGISTERED', user._id, `New user registered: ${email} (${user.role})`);

        res.status(201).json({ message: 'User registered successfully', userId: user._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Verify that user role matches selected login role
        if (role && user.role !== role) {
            return res.status(400).json({ message: `Access denied. Your registered role is ${user.role}.` });
        }

        // Check if user is blocked by admin
        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account has been suspended by the administrator.' });
        }

        const payload = { id: user._id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Log audit
        await logAudit('USER_LOGIN', user._id, `User logged in as ${user.role}`);

        res.status(200).json({ token, user: { id: user._id, name: user.name, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User with this email does not exist' });

        // Generate 6-digit verification code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = resetCode;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        console.log(`\n========================================\n[DEV RESET CODE] For ${email}: ${resetCode}\n========================================\n`);

        res.status(200).json({ 
            message: 'Verification code generated successfully. Please check your inbox.', 
            devResetCode: resetCode 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        const user = await User.findOne({ 
            email, 
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = '';
        user.resetPasswordExpires = undefined;
        await user.save();

        // Log audit
        await logAudit('PASSWORD_RESET', user._id, `Password reset successfully for ${email}`);

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isBlocked = !user.isBlocked;
        await user.save();

        // Log audit
        await logAudit(
            user.isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
            req.user.id,
            `${user.isBlocked ? 'Blocked' : 'Unblocked'} user account: ${user.email}`
        );

        res.status(200).json({ message: `User has been ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const oldRole = user.role;
        user.role = role;
        await user.save();

        // Log audit
        await logAudit(
            'USER_ROLE_UPDATED',
            req.user.id,
            `Updated role of user ${user.email} from ${oldRole} to ${role}`
        );

        res.status(200).json({ message: 'User role updated successfully', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAuditLogs = async (req, res) => {
    try {
        const AuditLog = require('../models/AuditLog');
        const logs = await AuditLog.find()
            .populate('performedBy', 'name email role')
            .sort({ createdAt: -1 })
            .limit(100);
        res.status(200).json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
