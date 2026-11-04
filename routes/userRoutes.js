
const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = (db) => {
    const router = express.Router();

    const users = db.collection('users');

    const validRoles = ['admin', 'inspector', 'business_owner'];

    // GET: Fetch all users
    router.get('/', async (req, res) => {
        try {
            const result = await users.find({}).toArray();

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // GET: Fetch user by ID
    router.get('/:id', async (req, res) => {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    message: 'Invalid user ID'
                });
            }

            const result = await users.findOne({
                _id: new ObjectId(req.params.id)
            });

            if (!result) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // POST: Create a new user
    router.post('/', async (req, res) => {
        try {
            const { name, email, role, phone } = req.body;

            if (!name || !email || !role) {
                return res.status(400).json({
                    message: 'Name, email and role are required'
                });
            }

            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    message: 'Invalid user role'
                });
            }

            if (typeof email !== 'string' ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({
                    message: 'Invalid email address'
                });
            }

            const existingUser = await users.findOne({
                email: email.trim()
            });

            if (existingUser) {
                return res.status(409).json({
                    message: 'Email already exists'
                });
            }

            const newUser = {
                name: name.trim(),
                email: email.trim(),
                role
            };

            if (phone !== undefined) {
                newUser.phone = phone;
            }

            const result = await users.insertOne(newUser);

            res.status(201).json({
                message: 'User created successfully',
                insertedId: result.insertedId
            });

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // PUT: Update an existing user
    router.put('/:id', async (req, res) => {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    message: 'Invalid user ID'
                });
            }

            const { name, email, role, phone } = req.body;

            const updateData = {};

            if (name !== undefined) {
                if (typeof name !== 'string' || !name.trim()) {
                    return res.status(400).json({
                        message: 'Invalid name'
                    });
                }

                updateData.name = name.trim();
            }

            if (email !== undefined) {
                if (typeof email !== 'string' ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    return res.status(400).json({
                        message: 'Invalid email address'
                    });
                }

                const existingUser = await users.findOne({
                    email: email.trim(),
                    _id: { $ne: new ObjectId(req.params.id) }
                });

                if (existingUser) {
                    return res.status(409).json({
                        message: 'Email already exists'
                    });
                }

                updateData.email = email.trim();
            }

            if (role !== undefined) {
                if (!validRoles.includes(role)) {
                    return res.status(400).json({
                        message: 'Invalid user role'
                    });
                }

                updateData.role = role;
            }

            if (phone !== undefined) {
                updateData.phone = phone;
            }

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    message: 'No valid fields provided for update'
                });
            }

            const result = await users.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: updateData }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            res.status(200).json({
                message: 'User updated successfully'
            });

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // DELETE: Delete a user
    router.delete('/:id', async (req, res) => {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    message: 'Invalid user ID'
                });
            }

            const userId = new ObjectId(req.params.id);

            // Check whether user owns any businesses
            const ownedBusinesses = await db.collection('businesses')
                .countDocuments({ ownerId: userId });

            // Check whether user reviewed any applications
            const reviewedApplications = await db.collection('licenseApplications')
                .countDocuments({ reviewedBy: userId });

            // Check whether user has conducted any inspections
            const conductedInspections = await db.collection('inspections')
                .countDocuments({ inspectorId: userId });



            if (
                ownedBusinesses > 0 ||
                reviewedApplications > 0 ||
                conductedInspections > 0
            ) {
                return res.status(400).json({
                    message: 'Cannot delete user because related records exist'
                });
            }

            const result = await users.deleteOne({
                _id: userId
            });

            if (result.deletedCount === 0) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            res.status(200).json({
                message: 'User deleted successfully'
            });

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    return router;
};
