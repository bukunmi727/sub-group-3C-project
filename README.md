# Sub-Group 3C — Product Inventory API

An API for managing gadget inventory, built with **Node.js, Express.js, and JavaScript**.

## Project Description

The Product Inventory API enables users to create, retrieve, update, and delete gadget records. It also supports low-stock monitoring and warranty-expiry checks, with input validation to maintain reliable inventory data.

## Features

- Retrieve all products or a specific product by ID.
- Add products with required-field validation.
- Prevent duplicate serial numbers.
- Partially update products using PATCH or update selected fields using PUT.
- Delete products by ID.
- Identify products at or below their low-stock levels.
- Find products with warranties expiring within a specified number of days.
- Configure the server port using environment variables.

## Technologies Used

- **Node.js** — JavaScript runtime.
- **Express.js** — API framework.
- **dotenv** — Environment variable configuration.
- **Postman** — API testing.
- **Git and GitHub** — Version control and collaboration.

## Getting Started

### Prerequisites

Install [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/). Use [Postman](https://www.postman.com/) to test the endpoints.

### 1. Clone the repository

```bash
git clone  https://github.com/bukunmi727/sub-group-3C-project.git
cd sub-group-3C-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3000
```

Ensure `.env` is listed in `.gitignore` and is not committed to GitHub.

### 4. Start the server

```bash
node app.js
```

Expected terminal output:

```text
Server running on port 3000
```

Open `http://localhost:3000/` in your browser to confirm the API is running.

## API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check API status |
| GET | `/products` | Retrieve all products |
| GET | `/products/low-stock` | Retrieve low-stock products |
| GET | `/products/warranty-expiring` | Retrieve products with warranties expiring within 30 days |
| GET | `/products/warranty-expiring?days=7` | Find warranties expiring within the next 7 days |
| GET | `/products/:id` | Retrieve a product by ID |
| POST | `/products` | Create a product |
| PATCH | `/products/:id` | Partially update a product |
| PUT | `/products/:id` | Update specified product fields |
| DELETE | `/products/:id` | Delete a product |

**Note:** Use a product ID in place of `:id`, for example `/products/1`. The warranty-expiry endpoint accepts an optional, non-negative whole number of days.

## Creating a Product

In Postman:

1. Select `POST`.
2. Enter `http://localhost:3000/products`.
3. Select **Body → raw → JSON**.
4. Send a request using this example:

```json
{
  "name": "Dell Inspiron 15",
  "brand": "Dell",
  "category": "Laptop",
  "price": 85000,
  "quantity": 6,
  "serialNumber": "SN-DEL-0009",
  "warrantyExpiry": "2028-05-20",
  "lowStockLevel": 2
}
```

A successful request returns `201 Created`. The API validates required fields, numeric values, warranty dates, and serial-number uniqueness.

## Updating a Product

To update only selected fields, use `PATCH /products/1` with a JSON body such as:

```json
{
  "quantity": 15
}
```

Only the specified field is changed.

## Response and Error Handling

The API uses standard HTTP status codes, including:

- `200 OK` — Request successful.
- `201 Created` — Product created successfully.
- `400 Bad Request` — Invalid input or missing required fields.
- `404 Not Found` — Product does not exist.
- `409 Conflict` — Duplicate serial number.

## Testing

Test the endpoints in Postman using valid and invalid requests. Verify successful product creation, retrieval, updates, deletion, low-stock results, warranty-expiry results, and validation errors.

## Project Structure

```text
sub-group-3C-project/
├── app.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
└── README.md
```

## Limitations

- Product records are stored in memory and reset when the server restarts.
- The project does not currently use a database or authentication.
- This is a learning project demonstrating REST API development and group collaboration.

## Contributors

**Sub-Group 3C**

Developed collaboratively as a group project to demonstrate API development, validation, testing, and version control.