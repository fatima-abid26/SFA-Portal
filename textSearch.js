
require('dotenv').config();

const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI);

async function textSearch() {
    try {
        await client.connect();

        const db = client.db('sfa_portal');
        const businesses = db.collection('businesses');

        console.log('Connected to SFA database!');

        // Create a text index on business name and category
        await businesses.createIndex({
            name: 'text',
            category: 'text'
        });

        console.log('Text index created successfully!');

        // Search for businesses containing the word "Sindh"
        const results = await businesses.find(
            { $text: { $search: 'Sindh' } },
            {
                projection: {
                    name: 1,
                    category: 1,
                    score: { $meta: 'textScore' }
                }
            }
        )
        .sort({ score: { $meta: 'textScore' } })
        .toArray();

        console.log('\nText Search Results:');
        console.log(results);

    } catch (error) {
        console.error('Text Search Error:', error.message);
    } finally {
        await client.close();
    }
}

textSearch();
