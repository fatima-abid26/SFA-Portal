
require('dotenv').config();

const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI);

async function addSchemaValidation() {
    try {
        await client.connect();

        const db = client.db('sfa_portal');

        await db.command({
            collMod: 'users',
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['name', 'email', 'role'],
                    properties: {
                        name: {
                            bsonType: 'string',
                            description: 'Name must be a string'
                        },
                        email: {
                            bsonType: 'string',
                            description: 'Email must be a string'
                        },
                        role: {
                            enum: ['admin', 'inspector', 'business_owner'],
                            description: 'Role must be valid'
                        },
                        phone: {
                            bsonType: 'string'
                        }
                    }
                }
            },
            validationLevel: 'strict',
            validationAction: 'error'
        });

        console.log('JSON Schema Validation applied successfully!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.close();
    }
}

addSchemaValidation();
