# SFA Portal – Sindh Food Authority Business Licensing and Safety Audit Portal

## Project Overview

The **Sindh Food Authority (SFA) Business Licensing and Safety Audit Portal** is a web-based application designed to manage food businesses, license applications, inspections, and safety violations.

The system uses MongoDB Atlas as its database, Node.js and Express.js for backend development, and HTML, CSS, and JavaScript for the frontend dashboard.

It provides REST APIs for managing records and performing data operations, along with an interactive dashboard for monitoring business registrations and visualizing food safety data.

The project demonstrates important MongoDB concepts, including CRUD operations, schema design, referencing, indexing, aggregation pipelines, JSON Schema Validation, and Text Search.

## Technologies Used

- Node.js
- Express.js
- MongoDB Atlas
- MongoDB Node.js Driver
- JavaScript
- HTML
- CSS
- PowerShell for API testing

## Database Structure

**Database name:** `sfa_portal`

The database contains five collections:

1. **users** – Stores administrators, inspectors, and business owners.
2. **businesses** – Stores registered food business information.
3. **licenseApplications** – Stores license application records.
4. **inspections** – Stores food inspection records.
5. **violations** – Stores violations identified during inspections.

The collections are connected through MongoDB ObjectId references.

See [schema.md](schema.md) for detailed collection structures, fields, relationships, and the database relationship diagram.

## Main Features

### 1. CRUD Operations

The application supports Create, Read, Update, and Delete operations for all five collections.

- Create new records.
- Retrieve all records or individual records.
- Update existing records.
- Delete records with reference validation where implemented.

### 2. Aggregation Pipelines

Five MongoDB aggregation pipelines are implemented to analyze database records:

1. Businesses by Category
2. Applications by Status
3. Average Inspection Score by Business Category
4. Violations Analysis by Type and Severity
5. Businesses with Most Violations

These pipelines use MongoDB aggregation operators such as `$group`, `$lookup`, `$unwind`, `$project`, `$sort`, and `$round`.

### 3. Indexing

An index is created on the `businessId` field in the `inspections` collection.

MongoDB's `explain("executionStats")` is used to compare query performance before and after indexing.

The comparison demonstrates the difference between a Collection Scan (COLLSCAN) and an Index Scan (IXSCAN).

### 4. JSON Schema Validation

MongoDB JSON Schema Validation is applied to the `users` collection.

It enforces required fields, data types, and valid user roles.

The validation rules ensure that invalid user documents are rejected by the database.

### 5. Frontend Dashboard

The project includes a web-based dashboard developed using HTML, CSS, and JavaScript.

The dashboard provides:

- Total businesses, license applications, inspections, and violations.
- Business search functionality.
- Registered business records.
- Visual representation of all five aggregation results.

The dashboard communicates with the backend through REST API endpoints.

### 6. MongoDB Text Search

The project implements MongoDB Text Search to allow users to search for businesses by name or category.

**Implementation:**

- A text index is created on the `name` and `category` fields in the `businesses` collection.
- MongoDB's `$text` operator is used to search for matching businesses.
- `$meta: "textScore"` is used to display search relevance scores.
- Search results are sorted according to their relevance.

**API Endpoint:**

`GET /api/search/businesses?search=Sindh`

**Testing:**

- Searching for "Sindh" successfully returned Sindh Bakers.
- Searching for "Bakery" successfully returned Sindh Bakers.
- Empty search input was rejected with a validation message.

## API Endpoints

**Base URL:** `http://localhost:5000`

### Collection Endpoints

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
git clone https://github.com/fatima-abid26/SFA-Portal.git
cd SFA-Portal
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
```

Open the `.env` file and add your own MongoDB Atlas connection string:

```env
MONGO_URI=your_mongodb_atlas_connection_string
```

**Important:** Do not upload your actual `.env` file or database credentials to GitHub.

### 4. Start the Server

```bash
node server.js
```

The application runs locally at:

`http://localhost:5000`

Open this address in your browser to access the frontend dashboard.

## Project Testing

The project has been tested using PowerShell commands, MongoDB Atlas, and the web browser.

Testing includes:

- CRUD operations for all five collections.
- Validation of records and their references.
- All five aggregation pipelines.
- Query performance before and after indexing.
- Valid and invalid document insertion using JSON Schema Validation.
- Business Text Search using different search terms.
- Frontend dashboard statistics and business search.

## Project Documentation

- `schema.md` – Detailed database schema, collection fields, relationships, and relationship diagram.
- `README.md` – Project overview, features, setup instructions, and API documentation.
- `Project Screenshots` – Screenshots of implementation, testing, indexing, validation, and dashboard results.

## Conclusion

The SFA Portal demonstrates the practical implementation of MongoDB database concepts through a web-based application.

It combines database management, backend API development, and frontend data visualization to support the management of food businesses, license applications, inspections, and safety violations.

The project provides practical experience with database design, CRUD operations, referencing, aggregation pipelines, indexing, JSON Schema Validation, and Text Search.

