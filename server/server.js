require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

app.get('/', (req, res) => {
    res.send('EMS API is running...');
});

// Database Connection
const seedDatabase = require('./seeder');
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB Connected');
    seedDatabase();
})
.catch(err => console.log('MongoDB connection error. Please ensure MongoDB is running locally.'));

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
