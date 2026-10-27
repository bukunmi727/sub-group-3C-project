require('dotenv').config();
const express = require("express");
const app = express();

// body parsing
app.use(express.json());

let products = [
  { id: 1, name: "iPhone 13", brand: "Apple", category: "Phone", price: 450000, quantity: 10, serialNumber: "SN-APL-0001", warrantyExpiry: "2027-03-15", lowStockLevel: 3 },
  { id: 2, name: "Galaxy Buds", brand: "Samsung", category: "Earbuds", price: 60000, quantity: 2, serialNumber: "SN-SAM-0002", warrantyExpiry: "2026-12-01", lowStockLevel: 5 },
  { id: 3, name: "MacBook Air", brand: "Apple", category: "Laptop", price: 900000, quantity: 5, serialNumber: "SN-APL-0003", warrantyExpiry: "2027-08-20", lowStockLevel: 2 },
  { id: 4, name: "PlayStation 5", brand: "Sony", category: "Console", price: 750000, quantity: 1, serialNumber: "SN-SNY-0004", warrantyExpiry: "2026-11-10", lowStockLevel: 2 },
  { id: 5, name: "Apple Watch SE", brand: "Apple", category: "Smartwatch", price: 250000, quantity: 12, serialNumber: "SN-APL-0005", warrantyExpiry: "2027-01-05", lowStockLevel: 3 },
  { id: 6, name: "JBL Flip 6", brand: "JBL", category: "Speaker", price: 120000, quantity: 15, serialNumber: "SN-JBL-0006", warrantyExpiry: "2026-10-30", lowStockLevel: 4 },
  { id: 7, name: "Redmi Note 12", brand: "Xiaomi", category: "Phone", price: 180000, quantity: 3, serialNumber: "SN-XIA-0007", warrantyExpiry: "2027-02-14", lowStockLevel: 5 },
  { id: 8, name: "Logitech MX Master 3", brand: "Logitech", category: "Mouse", price: 85000, quantity: 18, serialNumber: "SN-LOG-0008", warrantyExpiry: "2027-06-01", lowStockLevel: 4 }
];

app.get("/", (req, res) => {
  res.send("Product Inventory API is running");
});

// ROLE 2: READ ROUTES

// GET /products - Retrieve all products
app.get("/products", (req, res) => {
  res.status(200).json(products);
});

// GET /products/low-stock - Retrieve products at or below low-stock level
app.get("/products/low-stock", (req, res) => {
  const lowStockProducts = products.filter(
    (product) => product.quantity <= product.lowStockLevel
  );
  res.status(200).json(lowStockProducts);
});

// ROLE 4: GET /products/warranty-expiring
// (must stay above /products/:id)
// Products whose warranty ends within the next N days (default 30)
app.get("/products/warranty-expiring", (req, res) => {
  const days = req.query.days === undefined ? 30 : Number(req.query.days);

  if (!Number.isInteger(days) || days < 0) {
    return res.status(400).json({ message: "days must be a non-negative whole number" });
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setUTCDate(cutoff.getUTCDate() + days);

  const expiring = products.filter((product) => {
    const expiry = new Date(`${product.warrantyExpiry}T00:00:00Z`);
    return expiry >= today && expiry <= cutoff;
  });

  res.status(200).json(expiring);
});

// ROLE 3: CREATE ROUTE

// POST /products - Create a new product
app.post("/products", (req, res) => {
  const {
    name,
    brand,
    category,
    price,
    quantity,
    serialNumber,
    warrantyExpiry,
    lowStockLevel
  } = req.body || {};

  // 1. Check that all required fields are provided
  const requiredFields = {
    name,
    brand,
    category,
    price,
    quantity,
    serialNumber,
    warrantyExpiry,
    lowStockLevel
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([key, value]) =>
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    )
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: "All fields are required",
      missingFields
    });
  }

  // 2. Validate text fields
  if (
    typeof name !== "string" ||
    typeof brand !== "string" ||
    typeof category !== "string" ||
    typeof serialNumber !== "string"
  ) {
    return res.status(400).json({
      message: "Name, brand, category, and serial number must be text"
    });
  }

  // 3. Validate numeric fields
  if (
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price <= 0 ||
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity < 0 ||
    typeof lowStockLevel !== "number" ||
    !Number.isInteger(lowStockLevel) ||
    lowStockLevel < 0
  ) {
    return res.status(400).json({
      message: "Price must be positive; quantity and lowStockLevel must be non-negative integers"
    });
  }

  // 4. Validate warranty expiry date (YYYY-MM-DD)
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const expiryDate = new Date(`${warrantyExpiry}T00:00:00Z`);

  if (
    typeof warrantyExpiry !== "string" ||
    !datePattern.test(warrantyExpiry) ||
    Number.isNaN(expiryDate.getTime()) ||
    expiryDate.toISOString().slice(0, 10) !== warrantyExpiry
  ) {
    return res.status(400).json({
      message: "Warranty expiry must be a valid date in YYYY-MM-DD format"
    });
  }

  // 5. Reject duplicate serial numbers (case-insensitive)
  const duplicateSerial = products.some(
    (product) =>
      product.serialNumber.toLowerCase() === serialNumber.trim().toLowerCase()
  );

  if (duplicateSerial) {
    return res.status(409).json({
      message: "A product with this serial number already exists"
    });
  }

  // 6. Generate a new ID and create the product
  const newProduct = {
    id: Math.max(0, ...products.map((product) => product.id)) + 1,
    name: name.trim(),
    brand: brand.trim(),
    category: category.trim(),
    price,
    quantity,
    serialNumber: serialNumber.trim(),
    warrantyExpiry,
    lowStockLevel
  };

  products.push(newProduct);

  return res.status(201).json({
    message: "Product created successfully",
    product: newProduct
  });
});

// ROLE 3.1 

// PATCH /products/:id - Update selected product fields
app.patch("/products/:id", (req, res) => {
  const id = Number(req.params.id);

  const product = products.find((item) => item.id === id);

  if (!product) {
    return res.status(404).json({
      message: "Product not found"
    });
  }

  const updates = req.body;

  if (
    !updates ||
    typeof updates !== "object" ||
    Array.isArray(updates)
  ) {
    return res.status(400).json({
      message: "Request body must be a JSON object"
    });
  }

  const allowedFields = [
    "name",
    "brand",
    "category",
    "price",
    "quantity",
    "serialNumber",
    "warrantyExpiry",
    "lowStockLevel"
  ];

  const fields = Object.keys(updates);

  if (fields.length === 0) {
    return res.status(400).json({
      message: "Provide at least one field to update"
    });
  }

  const invalidFields = fields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      message: "Invalid fields provided",
      invalidFields
    });
  }

  // Validate text fields
  for (const field of ["name", "brand", "category", "serialNumber"]) {
    if (
      field in updates &&
      (typeof updates[field] !== "string" ||
        updates[field].trim() === "")
    ) {
      return res.status(400).json({
        message: `${field} must be non-empty text`
      });
    }
  }

  // Validate numeric fields
  if (
    ("price" in updates &&
      (typeof updates.price !== "number" ||
        !Number.isFinite(updates.price) ||
        updates.price <= 0)) ||
    ("quantity" in updates &&
      (!Number.isInteger(updates.quantity) ||
        updates.quantity < 0)) ||
    ("lowStockLevel" in updates &&
      (!Number.isInteger(updates.lowStockLevel) ||
        updates.lowStockLevel < 0))
  ) {
    return res.status(400).json({
      message: "Price must be positive; quantity and lowStockLevel must be non-negative integers"
    });
  }

  // Validate warranty date if supplied
  if ("warrantyExpiry" in updates) {
    const date = updates.warrantyExpiry;
    const parsedDate = new Date(`${date}T00:00:00Z`);

    if (
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      return res.status(400).json({
        message: "Warranty expiry must be a valid YYYY-MM-DD date"
      });
    }
  }

  // Prevent duplicate serial numbers on other products
  if ("serialNumber" in updates) {
    const serialNumber = updates.serialNumber.trim();

    const duplicate = products.some(
      (item) =>
        item.id !== id &&
        item.serialNumber.toLowerCase() === serialNumber.toLowerCase()
    );

    if (duplicate) {
      return res.status(409).json({
        message: "A product with this serial number already exists"
      });
    }
  }

  // Apply only the fields supplied in the request
  const cleanUpdates = { ...updates };

  for (const field of ["name", "brand", "category", "serialNumber"]) {
    if (field in cleanUpdates) {
      cleanUpdates[field] = cleanUpdates[field].trim();
    }
  }

  Object.assign(product, cleanUpdates);

  return res.status(200).json({
    message: "Product updated successfully",
    product
  });
});

// GET /products/:id - Retrieve a single product by ID
app.get("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((product) => product.id === id);

  if (!product) {
    return res.status(404).json({
      message: "Product not found"
    });
  }

  res.status(200).json(product);
});

// ROLE 4: UPDATE AND DELETE

// PUT /products/:id - Update a product
app.put("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const body = req.body || {};
  const allowed = ["name", "brand", "category", "price", "quantity", "serialNumber", "warrantyExpiry", "lowStockLevel"];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "Provide at least one field to update" });
  }

  // Text fields
  for (const key of ["name", "brand", "category", "serialNumber"]) {
    if (key in updates) {
      if (typeof updates[key] !== "string" || updates[key].trim() === "") {
        return res.status(400).json({ message: `${key} must be a non-empty text value` });
      }
      updates[key] = updates[key].trim();
    }
  }

  // Number fields
  if ("price" in updates && (typeof updates.price !== "number" || !Number.isFinite(updates.price) || updates.price <= 0)) {
    return res.status(400).json({ message: "price must be a positive number" });
  }
  for (const key of ["quantity", "lowStockLevel"]) {
    if (key in updates && (typeof updates[key] !== "number" || !Number.isInteger(updates[key]) || updates[key] < 0)) {
      return res.status(400).json({ message: `${key} must be a non-negative integer` });
    }
  }

  // Warranty date (YYYY-MM-DD)
  if ("warrantyExpiry" in updates) {
    const value = updates.warrantyExpiry;
    const date = new Date(`${value}T00:00:00Z`);
    if (
      typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      return res.status(400).json({ message: "warrantyExpiry must be a valid date in YYYY-MM-DD format" });
    }
  }

  // Serial number must stay unique (ignore this product itself)
  if ("serialNumber" in updates) {
    const duplicate = products.some(
      (p) => p.id !== id && p.serialNumber.toLowerCase() === updates.serialNumber.toLowerCase()
    );
    if (duplicate) {
      return res.status(409).json({ message: "A product with this serial number already exists" });
    }
  }

  Object.assign(product, updates);

  res.status(200).json({ message: "Product updated successfully", product });
});

// DELETE /products/:id - Delete a product
app.delete("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const [deleted] = products.splice(index, 1);

  res.status(200).json({ message: "Product deleted successfully", product: deleted });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
