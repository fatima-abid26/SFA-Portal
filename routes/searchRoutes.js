
const express = require('express');

module.exports = function (db) {
    const router = express.Router();

    const businesses = db.collection('businesses');

    // Search businesses using MongoDB Text Search
    router.get('/businesses', async (req, res) => {
        try {
            const searchTerm = req.query.search;

            if (!searchTerm || !searchTerm.trim()) {
                return res.status(400).json({
                    message: 'Please provide a search term.'
                });
            }

            const results = await businesses.find(
                {
                    $text: {
                        $search: searchTerm.trim()
                    }
                },
                {
                    projection: {
                        name: 1,
                        category: 1,
                        address: 1,
                        status: 1,
                        score: {
                            $meta: 'textScore'
                        }
                    }
                }
            )
            .sort({
                score: {
                    $meta: 'textScore'
                }
            })
            .toArray();

            res.status(200).json({
                message: 'Business search completed successfully.',
                totalResults: results.length,
                results: results
            });

        } catch (error) {
            res.status(500).json({
                message: 'Error searching businesses.',
                error: error.message
            });
        }
    });

    return router;
};
