const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");

const app = express();

const PORT = 3001;

// ====================
// DATABASE
// ====================

const db = new Database("store.db");

// Users table
db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
`).run();

// Products table
db.prepare(`
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        image TEXT NOT NULL
    )
`).run();

// Orders table
db.prepare(`
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();


// ====================
// SAMPLE PRODUCTS
// ====================

const productCount = db
    .prepare("SELECT COUNT(*) AS count FROM products")
    .get().count;

if (productCount === 0) {

    const addProduct = db.prepare(`
        INSERT INTO products
        (name, description, price, image)
        VALUES (?, ?, ?, ?)
    `);

    addProduct.run(
        "Laptop",
        "Powerful laptop for study and work.",
        120000,
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853"
    );

    addProduct.run(
        "Smart Phone",
        "Modern smartphone with excellent camera.",
        60000,
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
    );

    addProduct.run(
        "Headphones",
        "Wireless headphones with clear sound.",
        8000,
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
    );

    addProduct.run(
        "Smart Watch",
        "Stylish smartwatch for everyday use.",
        15000,
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
    );
}


// ====================
// MIDDLEWARE
// ====================

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(
    session({
        secret: "my-secret-key",
        resave: false,
        saveUninitialized: false
    })
);

// Website files
app.use(express.static("public"));


// ====================
// GET ALL PRODUCTS
// ====================

app.get("/api/products", (req, res) => {

    const products = db
        .prepare("SELECT * FROM products")
        .all();

    res.json(products);
});


// ====================
// GET ONE PRODUCT
// ====================

app.get("/api/products/:id", (req, res) => {

    const product = db
        .prepare("SELECT * FROM products WHERE id = ?")
        .get(req.params.id);

    if (!product) {

        return res.status(404).json({
            message: "Product not found"
        });
    }

    res.json(product);
});


// ====================
// REGISTER
// ====================

app.post("/api/register", async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {

        return res.status(400).json({
            message: "Please fill all fields"
        });
    }

    try {

        const hashedPassword =
            await bcrypt.hash(password, 10);

        db.prepare(`
            INSERT INTO users
            (name, email, password)
            VALUES (?, ?, ?)
        `).run(
            name,
            email,
            hashedPassword
        );

        res.json({
            message: "Registration successful"
        });

    } catch (error) {

        res.status(400).json({
            message: "Email already exists"
        });
    }
});


// ====================
// LOGIN
// ====================

app.post("/api/login", async (req, res) => {

    const { email, password } = req.body;

    const user = db
        .prepare("SELECT * FROM users WHERE email = ?")
        .get(email);

    if (!user) {

        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const correctPassword =
        await bcrypt.compare(password, user.password);

    if (!correctPassword) {

        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email
    };

    res.json({
        message: "Login successful",
        user: req.session.user
    });
});


// ====================
// LOGOUT
// ====================

app.get("/api/logout", (req, res) => {

    req.session.destroy(() => {

        res.json({
            message: "Logged out successfully"
        });

    });
});


// ====================
// CHECK USER
// ====================

app.get("/api/user", (req, res) => {

    if (!req.session.user) {

        return res.json({
            loggedIn: false
        });
    }

    res.json({
        loggedIn: true,
        user: req.session.user
    });
});


// ====================
// PLACE ORDER
// ====================

app.post("/api/orders", (req, res) => {

    if (!req.session.user) {

        return res.status(401).json({
            message: "Please login first"
        });
    }

    const { cart } = req.body;

    if (!cart || cart.length === 0) {

        return res.status(400).json({
            message: "Cart is empty"
        });
    }

    let total = 0;

    for (const item of cart) {

        const product = db
            .prepare("SELECT * FROM products WHERE id = ?")
            .get(item.id);

        if (product) {

            total += product.price * item.quantity;
        }
    }

    const order = db.prepare(`
        INSERT INTO orders
        (user_id, total, status)
        VALUES (?, ?, ?)
    `).run(
        req.session.user.id,
        total,
        "Pending"
    );

    res.json({
        message: "Order placed successfully",
        orderId: order.lastInsertRowid
    });
});


// ====================
// GET USER ORDERS
// ====================

app.get("/api/orders", (req, res) => {

    if (!req.session.user) {

        return res.status(401).json({
            message: "Please login first"
        });
    }

    const orders = db.prepare(`
        SELECT *
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
    `).all(req.session.user.id);

    res.json(orders);
});


// ====================
// START SERVER
// ====================

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});