
require('dotenv').config();

const express = require('express');
const { MongoClient } = require('mongodb');

const path = require('path');
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

let initializationPromise;

async function initializeApp() {
    if (!initializationPromise) {
        initializationPromise = (async () => {
            await client.connect();

            const db = client.db('sfa_portal');

            await db.command({ ping: 1 });

            console.log('Connected to MongoDB Atlas successfully!');

            app.get('/', (req, res) => {
                res.sendFile(path.join(__dirname, 'public', 'index.html'));
            });

            app.use('/api/businesses', businessRoutes(db));
            app.use('/api/users', userRoutes(db));
            app.use('/api/license-applications', licenseApplicationRoutes(db));
            app.use('/api/inspections', inspectionRoutes(db));
            app.use('/api/violations', violationRoutes(db));
            app.use('/api/aggregations', aggregationRoutes(db));
            app.use('/api/search', searchRoutes(db));
        })();
    }

    return initializationPromise;
}

// Local development
if (require.main === module) {
    initializeApp()
        .then(() => {
            const PORT = process.env.PORT || 5000;

            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        })
        .catch((error) => {
            console.error('MongoDB connection failed:', error);
            process.exit(1);
        });
}

// Vercel serverless function
module.exports = async (req, res) => {
    try {
        await initializeApp();
        return app(req, res);
    } catch (error) {
        console.error('Application initialization failed:', error);
        return res.status(500).send('SFA Portal server initialization failed.');
    }
};
