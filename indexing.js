
require('dotenv').config();

const { MongoClient, ObjectId } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI);

async function testIndexing() {
    try {
        await client.connect();

        const db = client.db('sfa_portal');
        const inspections = db.collection('inspections');

        // Query to find inspections of a specific business
        const query = {
            businessId: new ObjectId('6ae8eae71f3d557a9da51ed8')
        };

        // BEFORE INDEXING
        console.log('\n--- BEFORE INDEXING ---');

        const before = await inspections.find(query).explain('executionStats');

        console.log('Query Plan:');
        console.log(before.queryPlanner.winningPlan);

        console.log('Documents Examined:',
            before.executionStats.totalDocsExamined);

        console.log('Execution Time (ms):',
            before.executionStats.executionTimeMillis);


        // CREATE INDEX
        await inspections.createIndex({ businessId: 1 });

        console.log('\nIndex created successfully!');


        // AFTER INDEXING
        console.log('\n--- AFTER INDEXING ---');

        const after = await inspections.find(query).explain('executionStats');

        console.log('Query Plan:');
        console.log(after.queryPlanner.winningPlan);

        console.log('Documents Examined:',
            after.executionStats.totalDocsExamined);

        console.log('Index Keys Examined:',
            after.executionStats.totalKeysExamined);

        console.log('Execution Time (ms):',
            after.executionStats.executionTimeMillis);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.close();
    }
}

testIndexing();
