
const express = require('express');

module.exports = (db) => {
    const router = express.Router();

    const businesses = db.collection('businesses');

    // GET: Fetch all businesses
    router.get('/', async (req, res) => {
        try {
            const result = await businesses.find({}).toArray();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // GET: Fetch business by ID
    router.get('/:id', async (req, res) => {
        try {
            const { ObjectId } = require('mongodb');

            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ message: 'Invalid business ID' });
            }

            const result = await businesses.findOne({
                _id: new ObjectId(req.params.id)
            });

            if (!result) {
                return res.status(404).json({ message: 'Business not found' });
            }

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // POST: Create a new business
    router.post('/', async (req, res) => {
        try {
            const result = await businesses.insertOne(req.body);

            res.status(201).json({
                message: 'Business created successfully',
                insertedId: result.insertedId
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // PUT: Update a business
    router.put('/:id', async (req, res) => {
        try {
            const { ObjectId } = require('mongodb');

            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ message: 'Invalid business ID' });
            }

            const { _id, ...updateData } = req.body;

            const result = await businesses.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: updateData }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Business not found' });
            }

            res.status(200).json({
                message: 'Business updated successfully'
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // DELETE: Delete a business
    router.delete('/:id', async (req, res) => {
        try {
            const { ObjectId } = require('mongodb');

            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ message: 'Invalid business ID' });
            }

            const businessId = new ObjectId(req.params.id);

            // Prevent deletion if related records exist
            const applications = await db.collection('licenseApplications')
                .countDocuments({ businessId: businessId });

            const inspections = await db.collection('inspections')
                .countDocuments({ businessId: businessId });

            if (applications > 0 || inspections > 0) {
                return res.status(400).json({
                    message: 'Cannot delete business because related records exist.'
                });
            }

            const result = await businesses.deleteOne({ _id: businessId });

            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Business not found' });
            }

            res.status(200).json({
                message: 'Business deleted successfully'
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    return router;
};

