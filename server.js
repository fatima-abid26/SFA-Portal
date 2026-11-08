
require('dotenv').config();

const express = require('express');
const { MongoClient } = require('mongodb');

const businessRoutes = require('./routes/businessRoutes');
const userRoutes = require('./routes/userRoutes');
const licenseApplicationRoutes = require('./routes/licenseApplicationRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');
const violationRoutes = require('./routes/violationRoutes');
const aggregationRoutes = require('./routes/aggregationRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();

app.use(express.json());
app.use(express.static('public'));

const client = new MongoClient(process.env.MONGO_URI);

async function startServer() {
    try {
        await client.connect();

        const db = client.db('sfa_portal');

        await db.command({ ping: 1 });

        console.log('Connected to MongoDB Atlas successfully!');

        app.get('/', (req, res) => {
            res.send('SFA Portal Backend is Running!');
        });

        // Business CRUD Routes
        app.use('/api/businesses', businessRoutes(db));
        // User CRUD Routes
        app.use('/api/users', userRoutes(db));
        // License Application CRUD Routes
        app.use('/api/license-applications', licenseApplicationRoutes(db));
        // Inspection CRUD Routes
        app.use('/api/inspections', inspectionRoutes(db));
        // Violation CRUD Routes
        app.use('/api/violations', violationRoutes(db));
        // Aggregation Pipeline Routes
        app.use('/api/aggregations', aggregationRoutes(db));
        // Search Routes
        app.use('/api/search', searchRoutes(db));

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
}

startServer();
