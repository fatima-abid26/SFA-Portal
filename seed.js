
require("dotenv").config();

const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI);

async function seedDatabase() {
    try {
        await client.connect();

        const db = client.db("sfa_portal");

        console.log("Connected to SFA database!");

        // Prevent accidental duplicate sample data
        const collections = [
            "users",
            "businesses",
            "licenseApplications",
            "inspections",
            "violations"
        ];

        for (const name of collections) {
            const count = await db.collection(name).countDocuments();

            if (count > 0) {
                throw new Error(
                    `${name} already contains data. Seeding stopped.`
                );
            }
        }

        // Generate IDs so documents can reference each other
        const adminId = new ObjectId();
        const inspector1Id = new ObjectId();
        const inspector2Id = new ObjectId();

        const owner1Id = new ObjectId();
        const owner2Id = new ObjectId();
        const owner3Id = new ObjectId();

        const business1Id = new ObjectId();
        const business2Id = new ObjectId();
        const business3Id = new ObjectId();

        const application1Id = new ObjectId();
        const application2Id = new ObjectId();
        const application3Id = new ObjectId();

        const inspection1Id = new ObjectId();
        const inspection2Id = new ObjectId();
        const inspection3Id = new ObjectId();

        // 1. USERS COLLECTION
        await db.collection("users").insertMany([
            {
                _id: adminId,
                name: "SFA Administrator",
                email: "admin@sfa.example",
                role: "admin",
                phone: "03000000001"
            },
            {
                _id: inspector1Id,
                name: "Ahmed Khan",
                email: "ahmed@sfa.example",
                role: "inspector",
                phone: "03000000002"
            },
            {
                _id: inspector2Id,
                name: "Sara Ali",
                email: "sara@sfa.example",
                role: "inspector",
                phone: "03000000003"
            },
            {
                _id: owner1Id,
                name: "Usman Ahmed",
                email: "usman@example.com",
                role: "business_owner"
            },
            {
                _id: owner2Id,
                name: "Fatima Noor",
                email: "fatima@example.com",
                role: "business_owner"
            },
            {
                _id: owner3Id,
                name: "Bilal Hussain",
                email: "bilal@example.com",
                role: "business_owner"
            }
        ]);

        // 2. BUSINESSES COLLECTION
        await db.collection("businesses").insertMany([
            {
                _id: business1Id,
                name: "Hyderabad Food Corner",
                category: "Restaurant",
                ownerId: owner1Id,
                address: {
                    area: "Latifabad",
                    city: "Hyderabad",
                    province: "Sindh"
                },
                status: "active",
                createdAt: new Date("2026-09-01")
            },
            {
                _id: business2Id,
                name: "Sindh Bakers",
                category: "Bakery",
                ownerId: owner2Id,
                address: {
                    area: "Gulshan-e-Iqbal",
                    city: "Karachi",
                    province: "Sindh"
                },
                status: "active",
                createdAt: new Date("2026-09-05")
            },
            {
                _id: business3Id,
                name: "Fresh Bites",
                category: "Fast Food",
                ownerId: owner3Id,
                address: {
                    area: "Military Road",
                    city: "Sukkur",
                    province: "Sindh"
                },
                status: "pending",
                createdAt: new Date("2026-09-10")
            }
        ]);

        // 3. LICENSE APPLICATIONS COLLECTION
        await db.collection("licenseApplications").insertMany([
            {
                _id: application1Id,
                businessId: business1Id,
                applicationDate: new Date("2026-09-02"),
                status: "approved",
                reviewedBy: adminId
            },
            {
                _id: application2Id,
                businessId: business2Id,
                applicationDate: new Date("2026-09-07"),
                status: "pending",
                reviewedBy: null
            },
            {
                _id: application3Id,
                businessId: business3Id,
                applicationDate: new Date("2026-09-12"),
                status: "rejected",
                reviewedBy: adminId
            }
        ]);

        // 4. INSPECTIONS COLLECTION
        await db.collection("inspections").insertMany([
            {
                _id: inspection1Id,
                businessId: business1Id,
                inspectorId: inspector1Id,
                inspectionDate: new Date("2026-09-15"),
                score: 88,
                result: "Passed",
                remarks: "Good hygiene standards."
            },
            {
                _id: inspection2Id,
                businessId: business2Id,
                inspectorId: inspector2Id,
                inspectionDate: new Date("2026-09-18"),
                score: 62,
                result: "Failed",
                remarks: "Food storage needs improvement."
            },
            {
                _id: inspection3Id,
                businessId: business3Id,
                inspectorId: inspector1Id,
                inspectionDate: new Date("2026-09-20"),
                score: 75,
                result: "Passed",
                remarks: "Minor improvements required."
            }
        ]);

        // 5. VIOLATIONS COLLECTION
        await db.collection("violations").insertMany([
            {
                businessId: business2Id,
                inspectionId: inspection2Id,
                type: "Improper Food Storage",
                severity: "High",
                status: "Open"
            },
            {
                businessId: business2Id,
                inspectionId: inspection2Id,
                type: "Poor Hygiene",
                severity: "Medium",
                status: "Open"
            },
            {
                businessId: business3Id,
                inspectionId: inspection3Id,
                type: "Improper Waste Disposal",
                severity: "Low",
                status: "Resolved"
            },
            {
                businessId: business1Id,
                inspectionId: inspection1Id,
                type: "Missing Display Label",
                severity: "Low",
                status: "Resolved"
            }
        ]);

        console.log("All five collections populated successfully!");

        for (const name of collections) {
            const count = await db.collection(name).countDocuments();
            console.log(`${name}: ${count} documents`);
        }

    } catch (error) {
        console.error("Seeding error:", error.message);
    } finally {
        await client.close();
    }
}

seedDatabase();
