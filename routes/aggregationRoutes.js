
const express = require('express');

const router = express.Router();

module.exports = (db) => {

    // 1. Count Businesses by Category
    router.get('/businesses-by-category', async (req, res) => {
        try {
            const result = await db.collection('businesses').aggregate([
                {
                    $group: {
                        _id: '$category',
                        totalBusinesses: { $sum: 1 }
                    }
                },
                {
                    $sort: { totalBusinesses: -1 }
                }
            ]).toArray();

            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });


    // 2. Count Applications by Status
    router.get('/applications-by-status', async (req, res) => {
        try {
            const result = await db.collection('licenseApplications').aggregate([
                {
                    $group: {
                        _id: '$status',
                        totalApplications: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]).toArray();

            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });


    // 3. Average Inspection Score by Business Category
    router.get('/average-inspection-score', async (req, res) => {
        try {
            const result = await db.collection('businesses').aggregate([
                {
                    $lookup: {
                        from: 'inspections',
                        localField: '_id',
                        foreignField: 'businessId',
                        as: 'inspections'
                    }
                },
                {
                    $unwind: '$inspections'
                },
                {
                    $group: {
                        _id: '$category',
                        averageScore: { $avg: '$inspections.score' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        category: '$_id',
                        averageScore: { $round: ['$averageScore', 2] }
                    }
                },
                {
                    $sort: { averageScore: -1 }
                }
            ]).toArray();

            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });


    // 4. Violations Analysis by Type and Severity
    router.get('/violations-analysis', async (req, res) => {
        try {
            const result = await db.collection('violations').aggregate([
                {
                    $group: {
                        _id: {
                            type: '$type',
                            severity: '$severity'
                        },
                        totalViolations: { $sum: 1 }
                    }
                },
                {
                    $sort: { totalViolations: -1 }
                }
            ]).toArray();

            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });


    // 5. Businesses with Most Violations
    router.get('/businesses-most-violations', async (req, res) => {
        try {
            const result = await db.collection('businesses').aggregate([
                {
                    $lookup: {
                        from: 'violations',
                        localField: '_id',
                        foreignField: 'businessId',
                        as: 'violations'
                    }
                },
                {
                    $project: {
                        name: 1,
                        category: 1,
                        totalViolations: { $size: '$violations' }
                    }
                },
                {
                    $sort: { totalViolations: -1 }
                }
            ]).toArray();

            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    return router;
};
