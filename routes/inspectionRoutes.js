
const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = (db) => {
    const router = express.Router();

    const inspections = db.collection('inspections');
    const businesses = db.collection('businesses');
    const users = db.collection('users');

    const validResults = ['Passed', 'Failed'];

    // GET: Fetch all inspections
    router.get('/', async (req, res) => {
        try {
            const result = await inspections.find({}).toArray();

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // GET: Fetch inspection by ID
    router.get('/:id', async (req, res) => {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    message: 'Invalid inspection ID'
                });
            }

            const result = await inspections.findOne({
                _id: new ObjectId(req.params.id)
            });

            if (!result) {
                return res.status(404).json({
                    message: 'Inspection not found'
                });
            }

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // POST: Create a new inspection
    router.post('/', async (req, res) => {
        try {
            const {
                businessId,
                inspectorId,
                inspectionDate,
                score,
                result,
                remarks
            } = req.body;

            if (
                !businessId ||
                !inspectorId ||
                !inspectionDate ||
                score === undefined ||
                !result
            ) {
                return res.status(400).json({
                    message: 'Business ID, inspector ID, date, score and result are required'
                });
            }

            if (!ObjectId.isValid(businessId) || !ObjectId.isValid(inspectorId)) {
                return res.status(400).json({
                    message: 'Invalid business ID or inspector ID'
                });
            }

            const parsedDate = new Date(inspectionDate);

            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    message: 'Invalid inspection date'
                });
            }

            if (typeof score !== 'number' || score < 0 || score > 100) {
                return res.status(400).json({
                    message: 'Score must be a number between 0 and 100'
                });
            }

            if (!validResults.includes(result)) {
                return res.status(400).json({
                    message: 'Result must be Passed or Failed'
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

            const inspectorExists = await users.findOne({
                _id: new ObjectId(inspectorId),
                role: 'inspector'
            });

            if (!inspectorExists) {
                return res.status(404).json({
                    message: 'Inspector not found or user is not an inspector'
                });
            }

            const newInspection = {
                businessId: new ObjectId(businessId),
                inspectorId: new ObjectId(inspectorId),
                inspectionDate: parsedDate,
                score,
                result,
                remarks: remarks || ''
            };

            const insertResult = await inspections.insertOne(newInspection);

            res.status(201).json({
                message: 'Inspection created successfully',
                insertedId: insertResult.insertedId
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // PUT: Update an existing inspection
    router.put('/:id', async (req, res) => {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    message: 'Invalid inspection ID'
                });
            }

            const updateData = {};
            const {
                businessId,
                inspectorId,
                inspectionDate,
                score,
                result,
                remarks
            } = req.body;

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

            if (inspectorId !== undefined) {
                if (!ObjectId.isValid(inspectorId)) {
                    return res.status(400).json({
                        message: 'Invalid inspector ID'
                    });
                }

                const inspectorExists = await users.findOne({
                    _id: new ObjectId(inspectorId),
                    role: 'inspector'
                });

                if (!inspectorExists) {
                    return res.status(404).json({
                        message: 'Inspector not found or user is not an inspector'
                    });
                }

                updateData.inspectorId = new ObjectId(inspectorId);
            }

            if (inspectionDate !== undefined) {
                const parsedDate = new Date(inspectionDate);

                if (isNaN(parsedDate.getTime())) {
                    return res.status(400).json({
                        message: 'Invalid inspection date'
                    });
                }

                updateData.inspectionDate = parsedDate;
            }

            if (score !== undefined) {
                if (typeof score !== 'number' || score < 0 || score > 100) {
                    return res.status(400).json({
                        message: 'Score must be a number between 0 and 100'
                    });
                }

                updateData.score = score;
            }

            if (result !== undefined) {
                if (!validResults.includes(result)) {
                    return res.status(400).json({
                        message: 'Result must be Passed or Failed'
                    });
                }

                updateData.result = result;
            }

            if (remarks !== undefined) {
                updateData.remarks = remarks;
            }

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    message: 'No valid fields provided for update'
                });
            }

            const updateResult = await inspections.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: updateData }
            );

            if (updateResult.matchedCount === 0) {
                return res.status(404).json({
                    message: 'Inspection not found'
                });
            }

            res.status(200).json({
                message: 'Inspection updated successfully'
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // DELETE: Delete an inspection
    router.delete('/:id', async (req, res) => {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    message: 'Invalid inspection ID'
                });
            }

            const linkedViolations = await db.collection('violations')
                .countDocuments({
                    inspectionId: new ObjectId(req.params.id)
                });

            if (linkedViolations > 0) {
                return res.status(400).json({
                    message: 'Cannot delete inspection because violations are linked to it'
                });
            }

            const deleteResult = await inspections.deleteOne({
                _id: new ObjectId(req.params.id)
            });

            if (deleteResult.deletedCount === 0) {
                return res.status(404).json({
                    message: 'Inspection not found'
                });
            }

            res.status(200).json({
                message: 'Inspection deleted successfully'
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    return router;
};
