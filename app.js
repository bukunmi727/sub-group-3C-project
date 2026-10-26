require('dotenv').config();

const express = require("express")
const app = express();

//body parsing
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

//ROLE 2: READ ROUTES
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});