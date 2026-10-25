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