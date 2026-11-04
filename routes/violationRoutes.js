
const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = (db) => {
    const router = express.Router();

    const violations = db.collection('violations');
    const businesses = db.collection('businesses');
    const inspections = db.collection('inspections');

    const validSeverities = ['Low', 'Medium', 'High'];
    const validStatuses = ['Open', 'Resolved'];

    // GET: Fetch all violations
    router.get('/', async (req, res) => {
        try {
            const result = await violations.find({}).toArray();

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // GET: Fetch violation by ID
    router.get('/:id', async (req, res) => {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    message: 'Invalid violation ID'
                });
            }

            const result = await violations.findOne({
                _id: new ObjectId(req.params.id)
            });

            if (!result) {
                return res.status(404).json({
                    message: 'Violation not found'
                });
            }

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // POST: Create a new violation
    router.post('/', async (req, res) => {
        try {
            const { businessId, inspectionId, type, severity, status } = req.body;

            if (!businessId || !inspectionId || !type || !severity || !status) {
                return res.status(400).json({
                    message: 'Business ID, inspection ID, type, severity and status are required'
                });
            }

            if (!ObjectId.isValid(businessId) || !ObjectId.isValid(inspectionId)) {
                return res.status(400).json({
                    message: 'Invalid business ID or inspection ID'
                });
            }

            if (!validSeverities.includes(severity)) {
                return res.status(400).json({
                    message: 'Invalid violation severity'
                });
            }

            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    message: 'Invalid violation status'
                });
            }

            const business = await businesses.findOne({
                _id: new ObjectId(businessId)
            });

            if (!business) {
                return res.status(404).json({
                    message: 'Business not found'
                });
            }

            const inspection = await inspections.findOne({
                _id: new ObjectId(inspectionId)
            });

            if (!inspection) {
                return res.status(404).json({
                    message: 'Inspection not found'
                });
            }

            if (inspection.businessId.toString() !== businessId) {
                return res.status(400).json({
                    message: 'Inspection does not belong to this business'
                });
            }

            const newViolation = {
                businessId: new ObjectId(businessId),
                inspectionId: new ObjectId(inspectionId),
                type,
                severity,
                status
            };

            const result = await violations.insertOne(newViolation);

            res.status(201).json({
                message: 'Violation created successfully',
                insertedId: result.insertedId
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // PUT: Update an existing violation
    router.put('/:id', async (req, res) => {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    message: 'Invalid violation ID'
                });
            }

            const violationId = new ObjectId(req.params.id);

            const existingViolation = await violations.findOne({
                _id: violationId
            });

            if (!existingViolation) {
                return res.status(404).json({
                    message: 'Violation not found'
                });
            }

            const { businessId, inspectionId, type, severity, status } = req.body;

            const updateData = {};

            if (businessId !== undefined) {
                if (!ObjectId.isValid(businessId)) {
                    return res.status(400).json({
                        message: 'Invalid business ID'
                    });
                }

                updateData.businessId = new ObjectId(businessId);
            }

            if (inspectionId !== undefined) {
                if (!ObjectId.isValid(inspectionId)) {
                    return res.status(400).json({
                        message: 'Invalid inspection ID'
                    });
                }

                updateData.inspectionId = new ObjectId(inspectionId);
            }

            const finalBusinessId = updateData.businessId || existingViolation.businessId;
            const finalInspectionId = updateData.inspectionId || existingViolation.inspectionId;

            if (businessId !== undefined || inspectionId !== undefined) {
                const business = await businesses.findOne({
                    _id: finalBusinessId
                });

                if (!business) {
                    return res.status(404).json({
                        message: 'Business not found'
                    });
                }

                const inspection = await inspections.findOne({
                    _id: finalInspectionId
                });

                if (!inspection) {
                    return res.status(404).json({
                        message: 'Inspection not found'
                    });
                }

                if (inspection.businessId.toString() !== finalBusinessId.toString()) {
                    return res.status(400).json({
                        message: 'Inspection does not belong to this business'
                    });
                }
            }

            if (type !== undefined) {
                if (typeof type !== 'string' || !type.trim()) {
                    return res.status(400).json({
                        message: 'Violation type cannot be empty'
                    });
                }

                updateData.type = type;
            }

            if (severity !== undefined) {
                if (!validSeverities.includes(severity)) {
                    return res.status(400).json({
                        message: 'Invalid violation severity'
                    });
                }

                updateData.severity = severity;
            }

            if (status !== undefined) {
                if (!validStatuses.includes(status)) {
                    return res.status(400).json({
                        message: 'Invalid violation status'
                    });
                }

                updateData.status = status;
            }

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    message: 'No valid fields provided for update'
                });
            }

            await violations.updateOne(
                { _id: violationId },
                { $set: updateData }
            );

            res.status(200).json({
                message: 'Violation updated successfully'
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // DELETE: Delete a violation
    router.delete('/:id', async (req, res) => {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    message: 'Invalid violation ID'
                });
            }

            const result = await violations.deleteOne({
                _id: new ObjectId(req.params.id)
            });

            if (result.deletedCount === 0) {
                return res.status(404).json({
                    message: 'Violation not found'
                });
            }

            res.status(200).json({
                message: 'Violation deleted successfully'
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    return router;
};
