# SAF Portal – MongoDB Database Management System

## Project Overview

SAF Portal is a backend database management system designed to manage food businesses, license applications, inspections, and violations.

The system uses MongoDB Atlas for database management and Node.js with Express.js to provide REST APIs for performing CRUD operations and data analysis.

## Technologies Used

- Node.js
- Express.js
- MongoDB Atlas
- MongoDB Node.js Driver
- JavaScript
- PowerShell for API testing

## Database Structure

Database name: `sfa_portal`

The database contains five collections:

1. **users** – Stores administrators, inspectors, and business owners.
2. **businesses** – Stores registered food business information.
3. **licenseApplications** – Stores license application records.
4. **inspections** – Stores food inspection records.
5. **violations** – Stores violations identified during inspections.

See [schema.md](schema.md) for detailed database schema and relationships.

## Main Features

### 1. CRUD Operations
- Create new records.
- Retrieve all records or individual records.
- Update existing records.
- Delete records with reference validation where implemented.

CRUD operations are available for all five collections.

### 2. Aggregation Pipelines

Five MongoDB aggregation pipelines are implemented:

1. Businesses by Category
2. Applications by Status
3. Average Inspection Score by Business Category
4. Violations Analysis by Type and Severity
5. Businesses with Most Violations

### 3. Indexing

An index is created on the `businessId` field in the inspections collection.

MongoDB's `explain("executionStats")` is used to compare query execution before and after indexing.

### 4. JSON Schema Validation

MongoDB JSON Schema Validation is applied to the users collection to enforce required fields and valid user roles.

Invalid user documents are rejected by the database.

### 5. Frontend Dashboard

The project includes a web-based dashboard built using HTML, CSS, and JavaScript.

The dashboard provides:

- Total businesses, license applications, inspections, and violations.
- Business search functionality.
- Registered business records.
- Visual representation of all five aggregation results.

The dashboard communicates with the backend through REST API endpoints.

## API Endpoints

Base URL: `http://localhost:5000`

| Collection | Endpoint |
|---|---|
| Businesses | `/api/businesses` |
| Users | `/api/users` |
| License Applications | `/api/license-applications` |
| Inspections | `/api/inspections` |
| Violations | `/api/violations` |
| Business Search | `/api/search/businesses?search=Sindh` |

Each collection supports GET, POST, PUT, and DELETE operations.

### Aggregation Endpoints

| Pipeline | Endpoint |
|---|---|
| Businesses by Category | `/api/aggregations/businesses-by-category` |
| Applications by Status | `/api/aggregations/applications-by-status` |
| Average Inspection Score | `/api/aggregations/average-inspection-score` |
| Violations Analysis | `/api/aggregations/violations-analysis` |
| Businesses with Most Violations | `/api/aggregations/businesses-most-violations` |

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd SAF-Portal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file by copying the provided `.env.example` file.

On Windows PowerShell, run:

```powershell
Copy-Item .env.example .env

### 4. Start the Server

```bash
node server.js
```

The backend runs on:

`http://localhost:5000`

## Project Testing

The project has been tested using PowerShell commands and MongoDB Atlas.

Testing includes:
- CRUD operations for all five collections.
- All five aggregation pipelines.
- Query performance before and after indexing.
- Valid and invalid document insertion using JSON Schema Validation.

## Project Documentation

- `schema.md` – Database schema and relationships.
- `Project Screenshots` – Screenshots of implementation and testing.

## Conclusion

SAF Portal demonstrates the practical implementation of MongoDB database concepts, including schema design, CRUD operations, aggregation pipelines, indexing, and schema validation.


## Advanced MongoDB Feature: Text Search

The project implements MongoDB Text Search to allow users to search for businesses by name or category.

### Implementation
- A text index is created on the `name` and `category` fields in the businesses collection.
- MongoDB `$text` operator is used to search for matching businesses.
- `$meta: "textScore"` is used to display search relevance scores.
- Search results are sorted according to their relevance.

### API Endpoint

`GET /api/search/businesses?search=Sindh`

### Testing
- Searching for "Sindh" successfully returned Sindh Bakers.
- Searching for "Bakery" successfully returned Sindh Bakers.
- Empty search input was rejected with a validation message.


## Database Schema

The project uses five MongoDB collections:

1. Users
2. Businesses
3. License Applications
4. Inspections
5. Violations

These collections are connected through MongoDB ObjectId references.

The complete database schema, collection fields, relationships, and Mermaid relationship diagram are documented here:

[View Database Schema and Relationship Diagram](schema.md)
