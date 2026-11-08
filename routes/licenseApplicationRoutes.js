
const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = (db) => {
    const router = express.Router();

    const applications = db.collection('licenseApplications');
    const businesses = db.collection('businesses');
    const users = db.collection('users');

    const validStatuses = ['pending', 'approved', 'rejected'];

    // GET: Fetch all license applications
    router.get('/', async (req, res) => {
        try {
            const result = await applications.find({}).toArray();

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // GET: Fetch application by ID
    router.get('/:id', async (req, res) => {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    message: 'Invalid application ID'
                });
            }

            const result = await applications.findOne({
                _id: new ObjectId(req.params.id)
            });

            if (!result) {
                return res.status(404).json({
                    message: 'Application not found'
                });
            }

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // POST: Create a new license application
    router.post('/', async (req, res) => {
        try {
            const { businessId, applicationDate, status, reviewedBy } = req.body;

            if (!businessId || !applicationDate || !status) {
                return res.status(400).json({
                    message: 'Business ID, application date and status are required'
                });
            }

            if (!ObjectId.isValid(businessId)) {
                return res.status(400).json({
                    message: 'Invalid business ID'
                });
            }

            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    message: 'Invalid application status'
                });
            }

            const parsedDate = new Date(applicationDate);

            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    message: 'Invalid application date'
                });
            }

            const businessExists = await businesses.findOne({
                _id: new ObjectId(businessId)
            });

            if (!businessExists) {
                return res.status(404).json({
                    message: 'Business not found'
                });
            }

            let reviewerId = null;

            if (reviewedBy !== undefined && reviewedBy !== null) {
                if (!ObjectId.isValid(reviewedBy)) {
                    return res.status(400).json({
                        message: 'Invalid reviewer ID'
                    });
                }

                const reviewerExists = await users.findOne({
                    _id: new ObjectId(reviewedBy)
                });

                if (!reviewerExists) {
                    return res.status(404).json({
                        message: 'Reviewer not found'
                    });
                }

                if (reviewerExists.role !== 'admin') {
                    return res.status(400).json({
                        message: 'Only an admin can review license applications'
                    });
                }

                reviewerId = new ObjectId(reviewedBy);
            }

            const newApplication = {
                businessId: new ObjectId(businessId),
                applicationDate: parsedDate,
                status,
                reviewedBy: reviewerId
            };

            const result = await applications.insertOne(newApplication);

            res.status(201).json({
                message: 'License application created successfully',
                insertedId: result.insertedId
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // PUT: Update an existing license application
    router.put('/:id', async (req, res) => {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    message: 'Invalid application ID'
                });
            }

            const updateData = {};
            const { businessId, applicationDate, status, reviewedBy } = req.body;

            if (businessId !== undefined) {
                if (!ObjectId.isValid(businessId)) {
                    return res.status(400).json({
                        message: 'Invalid business ID'
                    });
                }

                const businessExists = await businesses.findOne({
                    _id: new ObjectId(businessId)
                });

                if (!businessExists) {
                    return res.status(404).json({
                        message: 'Business not found'
                    });
                }

                updateData.businessId = new ObjectId(businessId);
            }

            if (applicationDate !== undefined) {
                const parsedDate = new Date(applicationDate);

                if (isNaN(parsedDate.getTime())) {
                    return res.status(400).json({
                        message: 'Invalid application date'
                    });
                }

                updateData.applicationDate = parsedDate;
            }

            if (status !== undefined) {
                if (!validStatuses.includes(status)) {
                    return res.status(400).json({
                        message: 'Invalid application status'
                    });
                }

                updateData.status = status;
            }

            if (reviewedBy !== undefined) {
                if (reviewedBy === null) {
                    updateData.reviewedBy = null;
                } else {
                    if (!ObjectId.isValid(reviewedBy)) {
                        return res.status(400).json({
                            message: 'Invalid reviewer ID'
                        });
                    }

                    const reviewerExists = await users.findOne({
                        _id: new ObjectId(reviewedBy)
                    });

                    if (!reviewerExists) {
                        return res.status(404).json({
                            message: 'Reviewer not found'
                        });
                    }

                    if (reviewerExists.role !== 'admin') {
                        return res.status(400).json({
                            message: 'Only an admin can review license applications'
                        });
                    }

                    updateData.reviewedBy = new ObjectId(reviewedBy);
                }
            }

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    message: 'No valid fields provided for update'
                });
            }

            const result = await applications.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: updateData }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    message: 'Application not found'
                });
            }

            res.status(200).json({
                message: 'License application updated successfully'
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // DELETE: Delete a license application
    router.delete('/:id', async (req, res) => {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    message: 'Invalid application ID'
                });
            }

            const result = await applications.deleteOne({
                _id: new ObjectId(req.params.id)
            });

            if (result.deletedCount === 0) {
                return res.status(404).json({
                    message: 'Application not found'
                });
            }

            res.status(200).json({
                message: 'License application deleted successfully'
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    return router;
};
