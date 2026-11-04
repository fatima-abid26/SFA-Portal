
require('dotenv').config();

const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI);

async function testValidation() {
    try {
        await client.connect();

        const db = client.db('sfa_portal');
        const users = db.collection('users');

        // Test 1: Invalid user (invalid role)
        console.log('\n--- TEST 1: INVALID USER ---');

        try {
            await users.insertOne({
                name: 'Test User',
                email: 'invalidtest@sfa.example',
                role: 'manager'
            });

            console.log('Unexpected: Invalid user was inserted.');
        } catch (error) {
            console.log('Invalid user rejected successfully!');
            console.log('Reason:', error.message);
        }

        // Test 2: Valid user
        console.log('\n--- TEST 2: VALID USER ---');

        const result = await users.insertOne({
            name: 'Validation Test User',
            email: 'validationtest@sfa.example',
            role: 'business_owner',
            phone: '03000000000'
        });

        console.log('Valid user inserted successfully!');

        // Delete temporary test user
        await users.deleteOne({ _id: result.insertedId });

        console.log('Temporary test user deleted successfully!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.close();
    }
}

testValidation();
