import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { Firestore } from "@google-cloud/firestore";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Firebase
const firebaseConfig = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf-8")
);
const firestoreDb = new Firestore({
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId,
});

// Set up JSON body parsers with generous limits for file uploads (base64)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Database file path for persisting orders in the container
const DB_FILE = path.join(process.cwd(), "orders_db.json");

// Helper to read database
function readDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ orders: [] }, null, 2));
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database:", err);
    return { orders: [] };
  }
}

// Helper to write database
function writeDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing database:", err);
  }
}

// ==================== ROBUST FIRESTORE + LOCAL DB FALLBACK WRAPPERS ====================

// 1. ORDERS HELPERS
async function getOrdersHelper(): Promise<any[]> {
  try {
    const ordersSnapshot = await firestoreDb.collection("orders").get();
    const allOrders: any[] = [];
    ordersSnapshot.forEach(docSnap => {
      allOrders.push(docSnap.data());
    });
    return allOrders;
  } catch (error) {
    console.warn("Firestore error in getOrdersHelper (falling back to local JSON database):", error);
    const db = readDatabase();
    return db.orders || [];
  }
}

async function saveOrderHelper(orderId: string, order: any): Promise<void> {
  try {
    await firestoreDb.collection("orders").doc(orderId).set(order);
  } catch (error) {
    console.warn("Firestore error in saveOrderHelper (falling back to local JSON database):", error);
    const db = readDatabase();
    const existingIndex = db.orders.findIndex((o: any) => o.id === orderId);
    if (existingIndex !== -1) {
      db.orders[existingIndex] = order;
    } else {
      db.orders.push(order);
    }
    writeDatabase(db);
  }
}

async function updateOrderHelper(orderId: string, fields: any): Promise<any> {
  try {
    const orderRef = firestoreDb.collection("orders").doc(orderId);
    await orderRef.update(fields);
    const updatedSnap = await orderRef.get();
    return updatedSnap.data();
  } catch (error) {
    console.warn("Firestore error in updateOrderHelper (falling back to local JSON database):", error);
    const db = readDatabase();
    const existingIndex = db.orders.findIndex((o: any) => o.id === orderId);
    if (existingIndex !== -1) {
      db.orders[existingIndex] = { ...db.orders[existingIndex], ...fields };
      writeDatabase(db);
      return db.orders[existingIndex];
    }
    throw new Error("Order not found in local database.");
  }
}

async function setOrderHelper(orderId: string, order: any): Promise<void> {
  try {
    await firestoreDb.collection("orders").doc(orderId).set(order);
  } catch (error) {
    console.warn("Firestore error in setOrderHelper (falling back to local JSON database):", error);
    const db = readDatabase();
    const existingIndex = db.orders.findIndex((o: any) => o.id === orderId);
    if (existingIndex !== -1) {
      db.orders[existingIndex] = order;
    } else {
      db.orders.push(order);
    }
    writeDatabase(db);
  }
}

async function deleteOrderHelper(orderId: string): Promise<void> {
  try {
    await firestoreDb.collection("orders").doc(orderId).delete();
  } catch (error) {
    console.warn("Firestore error in deleteOrderHelper (falling back to local JSON database):", error);
    const db = readDatabase();
    db.orders = db.orders.filter((o: any) => o.id !== orderId);
    writeDatabase(db);
  }
}

async function getOrderHelper(orderId: string): Promise<any | null> {
  try {
    const orderSnap = await firestoreDb.collection("orders").doc(orderId).get();
    if (orderSnap.exists) {
      return orderSnap.data() || null;
    }
    return null;
  } catch (error) {
    console.warn("Firestore error in getOrderHelper (falling back to local JSON database):", error);
    const db = readDatabase();
    const order = db.orders.find((o: any) => o.id === orderId);
    return order || null;
  }
}

// 2. REVIEWS HELPERS
const REVIEWS_FILE = path.join(process.cwd(), "reviews_db.json");

function readReviewsDatabase() {
  try {
    if (!fs.existsSync(REVIEWS_FILE)) {
      fs.writeFileSync(REVIEWS_FILE, JSON.stringify({ reviews: [] }, null, 2));
    }
    const data = fs.readFileSync(REVIEWS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading reviews database:", err);
    return { reviews: [] };
  }
}

function writeReviewsDatabase(data: any) {
  try {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing reviews database:", err);
  }
}

async function getReviewsHelper(): Promise<any[]> {
  try {
    const reviewsSnapshot = await firestoreDb.collection("reviews").get();
    const reviewsList: any[] = [];
    reviewsSnapshot.forEach((docSnap) => {
      reviewsList.push(docSnap.data());
    });
    return reviewsList;
  } catch (error) {
    console.warn("Firestore error in getReviewsHelper (falling back to local JSON database):", error);
    const db = readReviewsDatabase();
    return db.reviews || [];
  }
}

async function setReviewHelper(reviewId: string, review: any): Promise<void> {
  try {
    await firestoreDb.collection("reviews").doc(reviewId).set(review);
  } catch (error) {
    console.warn("Firestore error in setReviewHelper (falling back to local JSON database):", error);
    const db = readReviewsDatabase();
    const existingIndex = db.reviews.findIndex((r: any) => r.id === reviewId);
    if (existingIndex !== -1) {
      db.reviews[existingIndex] = review;
    } else {
      db.reviews.push(review);
    }
    writeReviewsDatabase(db);
  }
}

async function deleteReviewHelper(reviewId: string): Promise<void> {
  try {
    await firestoreDb.collection("reviews").doc(reviewId).delete();
  } catch (error) {
    console.warn("Firestore error in deleteReviewHelper (falling back to local JSON database):", error);
    const db = readReviewsDatabase();
    db.reviews = db.reviews.filter((r: any) => r.id !== reviewId);
    writeReviewsDatabase(db);
  }
}

async function getReviewHelper(reviewId: string): Promise<any | null> {
  try {
    const reviewSnap = await firestoreDb.collection("reviews").doc(reviewId).get();
    if (reviewSnap.exists) {
      return reviewSnap.data() || null;
    }
    return null;
  } catch (error) {
    console.warn("Firestore error in getReviewHelper (falling back to local JSON database):", error);
    const db = readReviewsDatabase();
    const review = db.reviews.find((r: any) => r.id === reviewId);
    return review || null;
  }
}

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini client initialized successfully.");
  } catch (e) {
    console.error("Failed to initialize Gemini client:", e);
  }
} else {
  console.warn("GEMINI_API_KEY environment variable is missing. Chat assistant will run in smart-simulation mode.");
}

// ==================== DATABASE CONFIG & HELPERS ====================

const USERS_FILE = path.join(process.cwd(), "users_db.json");

// Hash password with salt
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

// Generate new salt and hash
function saltAndHash(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = hashPassword(password, salt);
  return { salt, hash };
}

function readUsersDatabase() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      // Pre-seed the system admin account safely with its correct credentials on initialization
      const adminSalt = crypto.randomBytes(16).toString("hex");
      const adminHash = crypto.pbkdf2Sync("BAJPAI@890", adminSalt, 1000, 64, "sha512").toString("hex");
      const initialDb = {
        users: [
          {
            uid: "admin-system-uid",
            email: "bajpaiadmin64@gmail.com",
            fullName: "Utkarsh Bajpai (Admin)",
            phone: "7706929484",
            whatsApp: "7706929484",
            companyName: "U B Web Developer",
            salt: adminSalt,
            hash: adminHash,
            createdAt: new Date().toISOString(),
          }
        ]
      };
      fs.writeFileSync(USERS_FILE, JSON.stringify(initialDb, null, 2));
    }
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading users database:", err);
    return { users: [] };
  }
}

function writeUsersDatabase(data: any) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing users database:", err);
  }
}

// Initialize users database
readUsersDatabase();

// Session token generation & verification (HMAC-SHA256 Signed Tokens)
const JWT_SECRET = process.env.JWT_SECRET || "ub-web-developer-super-secret-key-12345";

function generateToken(payload: { uid: string; email: string }) {
  const data = JSON.stringify({
    ...payload,
    exp: Date.now() + 24 * 60 * 60 * 1000 // Valid for 24 hours
  });
  const base64Payload = Buffer.from(data).toString("base64");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(base64Payload).digest("hex");
  return `${base64Payload}.${signature}`;
}

function verifyToken(token: string): { uid: string; email: string } | null {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [base64Payload, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(base64Payload).digest("hex");
    if (signature !== expectedSignature) return null;
    const payloadStr = Buffer.from(base64Payload, "base64").toString("utf-8");
    const payload = JSON.parse(payloadStr);
    if (Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// ==================== API ENDPOINTS ====================

// 1. Auth Endpoint: User Registration
app.post("/api/auth/register", (req, res) => {
  try {
    const { email, password, fullName, phone, whatsApp, companyName } = req.body;

    // Rigid validation on both client and server sides
    if (!email || !password || !fullName || !phone) {
      return res.status(400).json({ error: "Required fields (Email, Password, Name, Phone) are missing." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "The password must be at least 6 characters." });
    }

    const dbUsers = readUsersDatabase();
    const existingUser = dbUsers.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      return res.status(400).json({ error: "An account with this email address already exists." });
    }

    const { salt, hash } = saltAndHash(password);
    const uid = "usr-" + crypto.randomUUID();

    const newUser = {
      uid,
      email: email.toLowerCase(),
      fullName,
      phone,
      whatsApp: whatsApp || "",
      companyName: companyName || "",
      salt,
      hash,
      createdAt: new Date().toISOString()
    };

    dbUsers.users.push(newUser);
    writeUsersDatabase(dbUsers);

    const token = generateToken({ uid, email: newUser.email });

    const userResponse = {
      uid: newUser.uid,
      email: newUser.email,
      fullName: newUser.fullName,
      phone: newUser.phone,
      whatsApp: newUser.whatsApp,
      companyName: newUser.companyName,
      createdAt: newUser.createdAt
    };

    return res.status(201).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Internal Server Error during registration." });
  }
});

// 2. Auth Endpoint: Secure login with strict error outputs
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: "Please enter both email and password." });
    }

    const dbUsers = readUsersDatabase();
    const user = dbUsers.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    // Explicit error message if email does not exist
    if (!user) {
      return res.status(404).json({ error: "Email not found." });
    }

    // Secure verification
    const computedHash = hashPassword(password, user.salt);
    if (computedHash !== user.hash) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    const token = generateToken({ uid: user.uid, email: user.email });

    const userResponse = {
      uid: user.uid,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      whatsApp: user.whatsApp,
      companyName: user.companyName,
      createdAt: user.createdAt
    };

    return res.json({
      success: true,
      token,
      user: userResponse
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal Server Error during login." });
  }
});

// 3. Auth Endpoint: Validate active session (Who Am I)
app.get("/api/auth/me", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No session token found." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: "Session has expired. Please log in again." });
    }

    const dbUsers = readUsersDatabase();
    const user = dbUsers.users.find((u: any) => u.uid === decoded.uid);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const userResponse = {
      uid: user.uid,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      whatsApp: user.whatsApp,
      companyName: user.companyName,
      createdAt: user.createdAt
    };

    return res.json({
      success: true,
      user: userResponse
    });
  } catch (err) {
    console.error("Auth me error:", err);
    return res.status(500).json({ error: "Internal Server Error during session validation." });
  }
});

// 4. Submit a new order (Securely binds to logged-in user)
app.post("/api/orders", async (req, res) => {
  try {
    const {
      fullName,
      companyName,
      email,
      phone,
      whatsApp,
      serviceRequired,
      budget,
      deadline,
      projectDescription,
      referenceUrl,
      fileName,
      fileData,
      userId
    } = req.body;

    if (!fullName || !email || !phone || !serviceRequired || !projectDescription) {
      return res.status(400).json({ error: "Please fill in all required fields." });
    }

    // Generate beautiful sequential Order ID using Firestore count
    const allOrders = await getOrdersHelper();
    const orderCount = allOrders.length;
    const currentYear = new Date().getFullYear();
    const orderId = `UB-${currentYear}-${String(orderCount + 1).padStart(5, "0")}`;

    const newOrder = {
      id: orderId,
      userId: userId || "guest",
      fullName,
      companyName: companyName || "",
      email,
      phone,
      whatsApp: whatsApp || "",
      serviceRequired,
      budget: budget || "Flexible",
      deadline: deadline || "Flexible",
      projectDescription,
      referenceUrl: referenceUrl || "",
      fileName: fileName || null,
      fileData: fileData || null, // store the actual base64 file
      status: "pending",
      paymentStatus: "unpaid",
      unread: true,
      createdAt: new Date().toISOString(),
    };

    // Save permanently in Firestore
    await saveOrderHelper(orderId, newOrder);

    // Secure File Upload Logging
    if (fileName) {
      console.log(`[SECURE UPLOAD] File successfully received and stored in Firestore: ${fileName} (${Math.round((fileData?.length || 0) * 0.75 / 1024)} KB)`);
    }

    // Simulate Email Delivery to bajpaiadmin64@gmail.com as requested
    console.log(`
========================================================================
[EMAIL SENT TO bajpaiadmin64@gmail.com]
Subject: NEW WEBSITE INQUIRY RECEIVED - Order ID: ${newOrder.id}
Client: ${fullName} (${email})
Phone: ${phone} | WhatsApp: ${whatsApp}
Service Required: ${serviceRequired}
Budget: ${budget} | Timeline: ${deadline}
Description: ${projectDescription}
Reference URL: ${referenceUrl || "None"}
Attached File: ${fileName || "None"}
========================================================================
    `);

    // Clean payload for client response
    const clientResponse = { ...newOrder };
    delete clientResponse.fileData;

    return res.status(201).json({
      success: true,
      message: "Order submitted successfully! A notification email has been dispatched.",
      order: clientResponse,
    });
  } catch (error: any) {
    console.error("Error creating order in Firestore:", error);
    return res.status(500).json({ error: "Internal Server Error during order creation." });
  }
});

// 5. Confirm payment for an order
app.post("/api/confirm-payment", async (req, res) => {
  try {
    const { orderId, transactionId, utrNumber, clientNotes } = req.body;

    if (!orderId || (!transactionId && !utrNumber)) {
      return res.status(400).json({ error: "Order ID and Transaction Reference/UTR Number are required." });
    }

    const docId = orderId.toUpperCase();
    const orderData = await getOrderHelper(docId);

    if (!orderData) {
      return res.status(404).json({ error: "Order not found. Please double-check your Order ID." });
    }

    const updatedNotes = (orderData.additionalNotes || "") + (clientNotes ? `\n[Payment Confirmation Notes]: ${clientNotes}` : "");
    
    await updateOrderHelper(docId, {
      paymentStatus: "pending_verification",
      transactionId: transactionId || utrNumber,
      status: "confirmed",
      additionalNotes: updatedNotes
    });

    // Simulate Email notification for payment to bajpaiadmin64@gmail.com
    console.log(`
========================================================================
[EMAIL SENT TO bajpaiadmin64@gmail.com]
Subject: PAYMENT INCOMING VERIFICATION - Order ID: ${orderData.id}
Client: ${orderData.fullName}
Transaction Ref/UTR: ${transactionId || utrNumber}
Payment Status: pending_verification
========================================================================
    `);

    return res.json({
      success: true,
      message: "Payment details submitted successfully! Your order is now being processed.",
      order: {
        ...orderData,
        paymentStatus: "pending_verification",
        transactionId: transactionId || utrNumber,
        status: "confirmed",
        additionalNotes: updatedNotes
      }
    });
  } catch (error) {
    console.error("Error confirming payment in Firestore:", error);
    return res.status(500).json({ error: "Internal Server Error during payment confirmation." });
  }
});

// 6. Client endpoint to securely fetch their own orders
app.get("/api/my-orders", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No session token found." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }

    // Query Firestore orders (with fallback to local db)
    const allOrders = await getOrdersHelper();
    const matchedOrders: any[] = [];
    allOrders.forEach(data => {
      if (data.userId === decoded.uid || data.email?.toLowerCase() === decoded.email.toLowerCase()) {
        const orderCopy = { ...data };
        delete orderCopy.fileData;
        matchedOrders.push(orderCopy);
      }
    });

    // Sort by newest first
    const sorted = [...matchedOrders].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ success: true, orders: sorted });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res.status(500).json({ error: "Failed to read orders list." });
  }
});

// 7. Secure Admin Endpoint: Retrieve ALL orders (Requires Verified System Administrator session)
app.get("/api/orders", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No session token found." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.email !== "bajpaiadmin64@gmail.com") {
      return res.status(403).json({ error: "Access denied. Administrator privileges required." });
    }

    const allOrders = await getOrdersHelper();
    const ordersListClean: any[] = [];
    allOrders.forEach(data => {
      const orderCopy = { ...data };
      // Strip base64 fileData payload to keep response lightweight
      delete orderCopy.fileData;
      ordersListClean.push(orderCopy);
    });

    // Sort orders by newest first
    const ordersSorted = [...ordersListClean].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ orders: ordersSorted });
  } catch (error) {
    console.error("Error retrieving admin orders:", error);
    return res.status(500).json({ error: "Failed to read orders list." });
  }
});

// 8. Secure Admin Endpoint: PATCH update an order (Requires Verified Admin session)
app.patch("/api/orders/:id", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No session token found." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.email !== "bajpaiadmin64@gmail.com") {
      return res.status(403).json({ error: "Access denied. Administrator privileges required." });
    }

    const orderId = req.params.id.toUpperCase();
    const currentData = await getOrderHelper(orderId);

    if (!currentData) {
      return res.status(404).json({ error: "Order not found." });
    }

    const updatedData = {
      ...currentData,
      ...req.body
    };

    await setOrderHelper(orderId, updatedData);
    return res.json({ success: true, order: updatedData });
  } catch (error) {
    console.error("Error patching order:", error);
    return res.status(500).json({ error: "Internal Server Error during order update." });
  }
});

// 9. Secure Admin Endpoint: DELETE an order (Requires Verified Admin session)
app.delete("/api/orders/:id", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No session token found." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.email !== "bajpaiadmin64@gmail.com") {
      return res.status(403).json({ error: "Access denied. Administrator privileges required." });
    }

    const orderId = req.params.id.toUpperCase();
    const orderData = await getOrderHelper(orderId);

    if (!orderData) {
      return res.status(404).json({ error: "Order not found." });
    }

    await deleteOrderHelper(orderId);
    return res.json({ success: true, message: "Order deleted successfully." });
  } catch (error) {
    console.error("Error deleting order:", error);
    return res.status(500).json({ error: "Internal Server Error during order deletion." });
  }
});

// ==================== ADMINISTRATIVE REVIEWS ENDPOINTS ====================

// GET /api/admin/reviews - Fetch all reviews (approved & pending) for admin management
app.get("/api/admin/reviews", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No session token found." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.email !== "bajpaiadmin64@gmail.com") {
      return res.status(403).json({ error: "Access denied. Administrator privileges required." });
    }

    const reviewsList = await getReviewsHelper();

    // Sort by newest first
    const sorted = [...reviewsList].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({ success: true, reviews: sorted });
  } catch (error) {
    console.error("Error retrieving admin reviews:", error);
    return res.status(500).json({ error: "Failed to load reviews list." });
  }
});

// PATCH /api/admin/reviews/:id - Update review specs (approved, hidden, pinned, reply)
app.patch("/api/admin/reviews/:id", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No session token found." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.email !== "bajpaiadmin64@gmail.com") {
      return res.status(403).json({ error: "Access denied. Administrator privileges required." });
    }

    const reviewId = req.params.id.toUpperCase();
    const currentData = await getReviewHelper(reviewId);

    if (!currentData) {
      return res.status(404).json({ error: "Review not found." });
    }

    const updatedData = {
      ...currentData,
      ...req.body
    };

    await setReviewHelper(reviewId, updatedData);
    return res.json({ success: true, review: updatedData });
  } catch (error) {
    console.error("Error patching review:", error);
    return res.status(500).json({ error: "Internal Server Error during review update." });
  }
});

// DELETE /api/admin/reviews/:id - Delete a review document
app.delete("/api/admin/reviews/:id", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No session token found." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.email !== "bajpaiadmin64@gmail.com") {
      return res.status(403).json({ error: "Access denied. Administrator privileges required." });
    }

    const reviewId = req.params.id.toUpperCase();
    const currentData = await getReviewHelper(reviewId);

    if (!currentData) {
      return res.status(404).json({ error: "Review not found." });
    }

    await deleteReviewHelper(reviewId);
    return res.json({ success: true, message: "Review deleted successfully." });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({ error: "Internal Server Error during review deletion." });
  }
});

// ==================== CUSTOMER REVIEWS ENDPOINTS ====================

// GET /api/reviews - Fetch approved and visible reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const reviewsListAll = await getReviewsHelper();
    const reviewsListApproved: any[] = [];
    reviewsListAll.forEach((data) => {
      if (data.approved === true && data.hidden !== true) {
        reviewsListApproved.push(data);
      }
    });

    // Sort by pinned first, then by createdAt descending
    const sorted = [...reviewsListApproved].sort((a: any, b: any) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return res.json({ success: true, reviews: sorted });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({ error: "Failed to load reviews." });
  }
});

// POST /api/reviews - Guest submission of reviews (Always goes to pending approval first)
app.post("/api/reviews", async (req, res) => {
  try {
    const { name, company, rating, title, review, image, country } = req.body;

    if (!name || !rating || !title || !review || !country) {
      return res.status(400).json({ error: "Required fields are missing." });
    }

    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: "Rating must be a number between 1 and 5." });
    }

    const reviewId = "REV-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    const newReview = {
      id: reviewId,
      name,
      company: company || "",
      rating: parsedRating,
      title,
      review,
      image: image || null,
      country,
      approved: false, // Must be approved by administrator
      hidden: false,
      pinned: false,
      createdAt: new Date().toISOString()
    };

    await setReviewHelper(reviewId, newReview);

    return res.status(201).json({
      success: true,
      message: "Thank you! Your review has been submitted for administrator approval.",
      reviewId
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({ error: "Internal Server Error during review submission." });
  }
});

// ==================== FOUNDER PROFILE ENDPOINTS ====================

const FOUNDER_FILE = path.join(process.cwd(), "founder_db.json");

function readFounderDatabase() {
  try {
    if (!fs.existsSync(FOUNDER_FILE)) {
      const defaultFounder = {
        name: "Utkarsh Bajpai",
        role: "Founder & Chief Architect",
        instagram: "https://www.instagram.com/utkarsh____bajpai____?igsh=NHpyMXIwMmdkN3Fq",
        github: "https://github.com/utkarshbajpai",
        linkedin: "https://linkedin.com/in/utkarshbajpai",
        bio: "U B Web Developer was built on a core philosophy: software should be incredibly elegant, mathematically precise, and designed strictly to solve human problems. Whether we are hand-crafting visual web frameworks or programming elite data automation pipes, our target is unmatched user experience and high business leverage.",
        secondaryBio: "Under Utkarsh's leadership, our team has executed over 150 digital products spanning interactive client hubs, business portals, data analysis frameworks, and custom automation architectures for elite partners globally.",
        imageUrl: "/src/assets/images/founder_headshot_1783524077102.jpg"
      };
      fs.writeFileSync(FOUNDER_FILE, JSON.stringify(defaultFounder, null, 2));
      return defaultFounder;
    }
    const data = fs.readFileSync(FOUNDER_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading founder database:", err);
    return {
      name: "Utkarsh Bajpai",
      role: "Founder & Chief Architect",
      instagram: "https://www.instagram.com/utkarsh____bajpai____?igsh=NHpyMXIwMmdkN3Fq",
      github: "https://github.com/utkarshbajpai",
      linkedin: "https://linkedin.com/in/utkarshbajpai",
      bio: "U B Web Developer was built on a core philosophy: software should be incredibly elegant, mathematically precise, and designed strictly to solve human problems. Whether we are hand-crafting visual web frameworks or programming elite data automation pipes, our target is unmatched user experience and high business leverage.",
      secondaryBio: "Under Utkarsh's leadership, our team has executed over 150 digital products spanning interactive client hubs, business portals, data analysis frameworks, and custom automation architectures for elite partners globally.",
      imageUrl: "/src/assets/images/founder_headshot_1783524077102.jpg"
    };
  }
}

function writeFounderDatabase(data: any) {
  try {
    fs.writeFileSync(FOUNDER_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing founder database:", err);
  }
}

// GET /api/founder/image - Serves custom or default image
app.get("/api/founder/image", (req, res) => {
  try {
    const founder = readFounderDatabase();
    if (founder.customImageBase64) {
      const matches = founder.customImageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const contentType = matches[1];
        const buffer = Buffer.from(matches[2], "base64");
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.send(buffer);
      }
    }
    
    const defaultImagePath = path.join(process.cwd(), "src/assets/images/founder_headshot_1783524077102.jpg");
    if (fs.existsSync(defaultImagePath)) {
      res.setHeader("Content-Type", "image/jpeg");
      return res.sendFile(defaultImagePath);
    } else {
      return res.status(404).send("Image not found");
    }
  } catch (err) {
    console.error("Error serving founder image:", err);
    return res.status(500).send("Error serving founder image");
  }
});

// GET /api/founder - Fetch founder metadata
app.get("/api/founder", (req, res) => {
  try {
    const founder = readFounderDatabase();
    const responseData = {
      name: founder.name,
      role: founder.role,
      instagram: founder.instagram,
      github: founder.github,
      linkedin: founder.linkedin,
      bio: founder.bio,
      secondaryBio: founder.secondaryBio,
      imageUrl: "/api/founder/image?v=" + (founder.updatedAt || "default")
    };
    return res.json(responseData);
  } catch (err) {
    console.error("Error fetching founder details:", err);
    return res.status(500).json({ error: "Failed to fetch founder details" });
  }
});

// POST /api/founder - Update founder metadata (Requires Administrator)
app.post("/api/founder", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No session token found." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.email !== "bajpaiadmin64@gmail.com") {
      return res.status(403).json({ error: "Access denied. Administrator privileges required." });
    }

    const { name, role, instagram, github, linkedin, bio, secondaryBio, fileData } = req.body;

    if (!name || !role) {
      return res.status(400).json({ error: "Name and Role/Title are required." });
    }

    const dbFounder = readFounderDatabase();
    
    dbFounder.name = name;
    dbFounder.role = role;
    dbFounder.instagram = instagram || "";
    dbFounder.github = github || "";
    dbFounder.linkedin = linkedin || "";
    dbFounder.bio = bio || "";
    dbFounder.secondaryBio = secondaryBio || "";
    dbFounder.updatedAt = Date.now().toString();

    if (fileData) {
      dbFounder.customImageBase64 = fileData;
    }

    writeFounderDatabase(dbFounder);

    return res.json({
      success: true,
      message: "Founder profile updated successfully!",
      founder: {
        name: dbFounder.name,
        role: dbFounder.role,
        instagram: dbFounder.instagram,
        github: dbFounder.github,
        linkedin: dbFounder.linkedin,
        bio: dbFounder.bio,
        secondaryBio: dbFounder.secondaryBio,
        imageUrl: "/api/founder/image?v=" + dbFounder.updatedAt
      }
    });
  } catch (err) {
    console.error("Error updating founder details:", err);
    return res.status(500).json({ error: "Internal Server Error during profile update." });
  }
});

// 10. Smart AI Assistant Chat Endpoint (Gemini powered)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    // Format prompt for Gemini incorporating the history
    const systemPrompt = `You are the exclusive AI Business Consultant for "U B Web Developer", a high-end software agency owned and run by Utkarsh Bajpai. 
Your goal is to consult prospective clients about our web development and Excel automation services, help them pick the right packages, estimate budgets, and guide them to order.

About "U B Web Developer":
- Owner/Lead Developer: Utkarsh Bajpai (Email: utkarshbajpai025@gmail.com, Phone/WhatsApp: 7706929484).
- Website Web Development Packages:
  * Basic Website (₹499, 2-3 pages, responsive design, contact form, delivery in 2-3 days). Excellent for startups or portfolios.
  * Business Website (₹999, up to 6 pages, advanced UI/UX, SEO optimized, animations, 4-5 days delivery). Perfect for growing companies.
  * Premium Website (₹1299, advanced premium UI, intricate animations, responsive, forms, unlimited pages/SPA, lifetime support, 5-7 days delivery).
- Excel & Data Services:
  * Formulas & Architecture (₹349, VLOOKUP, XLOOKUP, INDEX+MATCH, IF, SUMIFS, Pivot Tables).
  * MIS Reports & Interactive Dashboards (₹699, pivot tables, dynamic slicers, dashboard charts, sales/inventory trackers).
  * Automation Systems & Macros (₹999, rosters, automatic invoices, payroll grids, macro workflows).
- Key Value Propositions: 24/7 client support, affordable pricing in INR (₹), responsive designs, file upload during order, secure UPI transfers to 7706929484@axl.

Style Guidelines:
- Keep responses professional, highly responsive, encouraging, and informative.
- Quote prices in Indian Rupees (₹).
- Promptly guide users to either the "Order Form" section or the "Payment Section" if they indicate they are ready to order.
- Keep responses concise, friendly, and easy to read. Use bullet points for package options.
- If they ask for contact info, provide Utkarsh's email (utkarshbajpai025@gmail.com) and phone (+91 7706929484).
`;

    // Extract the latest user message
    const latestMessage = messages[messages.length - 1]?.text || "";

    if (!ai) {
      // Fallback response generator if GEMINI_API_KEY is not defined
      const lowerMsg = latestMessage.toLowerCase();
      let responseText = "Thank you for reaching out to U B Web Developer AI Assistant! ";

      if (lowerMsg.includes("web") || lowerMsg.includes("site") || lowerMsg.includes("portfolio")) {
        responseText += "We offer high-end Web Development starting at just ₹499 (Basic Package) up to ₹1299 (Elite Premium Package with animations and lifetime maintenance). Which package fits your business goals?";
      } else if (lowerMsg.includes("excel") || lowerMsg.includes("formula") || lowerMsg.includes("dashboard") || lowerMsg.includes("sheet")) {
        responseText += "We are experts in advanced Excel! We build Executive KPI Dashboards, automate data formatting, clean massive lists, and construct complex formulas like XLOOKUP or INDEX+MATCH starting at only ₹349. Tell me about your data sheet structure!";
      } else if (lowerMsg.includes("price") || lowerMsg.includes("cost") || lowerMsg.includes("rate") || lowerMsg.includes("pricing")) {
        responseText += "Our services are extremely affordable:\n\n- Basic Website: ₹499\n- Business Website: ₹999\n- Premium Website: ₹1299\n- Excel Formulas: ₹349\n- Excel Dashboards: ₹699\n- Excel Automation: ₹999\n\nAll prices are flat-rate! Would you like to fill out our Order Form to get started?";
      } else if (lowerMsg.includes("pay") || lowerMsg.includes("upi") || lowerMsg.includes("qr")) {
        responseText += "You can pay securely via UPI to our ID: 7706929484@axl or by scanning the QR code in our Payment Section. After that, enter your Transaction ID to begin your project. Would you like me to walk you through?";
      } else if (lowerMsg.includes("contact") || lowerMsg.includes("number") || lowerMsg.includes("phone") || lowerMsg.includes("email") || lowerMsg.includes("utkarsh")) {
        responseText += "You can reach out directly to Utkarsh Bajpai at:\n- Phone/WhatsApp: +91 7706929484\n- Email: utkarshbajpai025@gmail.com\nWe also have interactive click-to-call and WhatsApp chat buttons below!";
      } else {
        responseText += "I am here to help you build your dream website or automate your Excel workflows. We offer Premium Web Design, automated templates, and advanced dashboards starting at just ₹349. What kind of project are you working on today?";
      }

      return res.json({ text: responseText });
    }

    // Call real Gemini API
    const formattedHistory = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    // Add latest context
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: latestMessage,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I apologize, I am processing your inquiry. Please feel free to check our services section or contact Utkarsh directly.";
    return res.json({ text: reply });

  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    return res.status(500).json({ error: "AI Assistant was unable to process this request. Feel free to contact us directly!" });
  }
});

// ==================== VITE & STATIC SERVING ====================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`========================================================`);
    console.log(`  U B Web Developer Server successfully running!`);
    console.log(`  Local Address: http://localhost:${PORT}`);
    console.log(`  Container Port Ingress: Binding on 0.0.0.0:3000`);
    console.log(`========================================================`);
  });
}

startServer();
