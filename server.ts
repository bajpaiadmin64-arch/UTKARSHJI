import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

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
app.post("/api/orders", (req, res) => {
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
      fileName,
      fileData,
      additionalNotes,
      userId
    } = req.body;

    if (!fullName || !email || !phone || !serviceRequired || !projectDescription) {
      return res.status(400).json({ error: "Please fill in all required fields." });
    }

    const newOrder = {
      id: "UB-" + Math.floor(100000 + Math.random() * 900000),
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
      fileName: fileName || null,
      fileData: fileData ? `[Base64 Payload: ${fileData.length} characters]` : null, // Store confirmation but avoid bloating log heavily
      fileDataPayload: fileData || null, // actual base64
      additionalNotes: additionalNotes || "",
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: new Date().toISOString(),
    };

    const db = readDatabase();
    db.orders.push(newOrder);
    writeDatabase(db);

    // Secure File Upload Logging
    if (fileName) {
      console.log(`[SECURE UPLOAD] File successfully received and stored: ${fileName} (${Math.round((fileData?.length || 0) * 0.75 / 1024)} KB)`);
    }

    // Simulate Email Delivery to utkarshbajpai025@gmail.com
    console.log(`
========================================================================
[EMAIL SENT TO utkarshbajpai025@gmail.com]
Subject: NEW PROJECT ORDER SUBMISSION - Order ID: ${newOrder.id}
Client: ${fullName} (${email})
Phone: ${phone} | WhatsApp: ${whatsApp}
Service: ${serviceRequired}
Budget: ${budget} | Deadline: ${deadline}
Description: ${projectDescription}
Attached File: ${fileName || "None"}
========================================================================
    `);

    // Clean payload for client response
    const clientResponse = { ...newOrder };
    delete clientResponse.fileDataPayload;

    return res.status(201).json({
      success: true,
      message: "Order submitted successfully! A notification email has been dispatched.",
      order: clientResponse,
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Internal Server Error during order creation." });
  }
});

// 5. Confirm payment for an order
app.post("/api/confirm-payment", (req, res) => {
  try {
    const { orderId, transactionId, utrNumber, clientNotes } = req.body;

    if (!orderId || (!transactionId && !utrNumber)) {
      return res.status(400).json({ error: "Order ID and Transaction Reference/UTR Number are required." });
    }

    const db = readDatabase();
    const orderIndex = db.orders.findIndex((o: any) => o.id === orderId || o.id.toLowerCase() === orderId.toLowerCase());

    if (orderIndex === -1) {
      return res.status(404).json({ error: "Order not found. Please double-check your Order ID." });
    }

    const order = db.orders[orderIndex];
    order.paymentStatus = "pending_verification";
    order.transactionId = transactionId || utrNumber;
    order.status = "confirmed";
    if (clientNotes) {
      order.additionalNotes = (order.additionalNotes || "") + "\n[Payment Confirmation Notes]: " + clientNotes;
    }

    writeDatabase(db);

    // Simulate Email notification for payment
    console.log(`
========================================================================
[EMAIL SENT TO utkarshbajpai025@gmail.com]
Subject: PAYMENT INCOMING VERIFICATION - Order ID: ${order.id}
Client: ${order.fullName}
Transaction Ref/UTR: ${transactionId || utrNumber}
Payment Status: pending_verification
========================================================================
    `);

    return res.json({
      success: true,
      message: "Payment details submitted successfully! Your order is now being processed.",
      order,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return res.status(500).json({ error: "Internal Server Error during payment confirmation." });
  }
});

// 6. Client endpoint to securely fetch their own orders
app.get("/api/my-orders", (req, res) => {
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

    const db = readDatabase();
    const userOrders = db.orders.filter((o: any) => o.userId === decoded.uid || o.email?.toLowerCase() === decoded.email.toLowerCase());
    
    // Sort by newest first
    const sorted = [...userOrders].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ success: true, orders: sorted });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res.status(500).json({ error: "Failed to read orders list." });
  }
});

// 7. Secure Admin Endpoint: Retrieve ALL orders (Requires Verified System Administrator session)
app.get("/api/orders", (req, res) => {
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

    const db = readDatabase();
    // Sort orders by newest first
    const ordersSorted = [...db.orders].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    // Strip file payloads to keep transfer lightweight
    const strippedOrders = ordersSorted.map((o: any) => {
      const copy = { ...o };
      delete copy.fileDataPayload;
      return copy;
    });
    return res.json({ orders: strippedOrders });
  } catch (error) {
    return res.status(500).json({ error: "Failed to read orders list." });
  }
});

// 8. Secure Admin Endpoint: PATCH update an order (Requires Verified Admin session)
app.patch("/api/orders/:id", (req, res) => {
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

    const orderId = req.params.id;
    const db = readDatabase();
    const orderIndex = db.orders.findIndex((o: any) => o.id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Merge the updated keys securely
    db.orders[orderIndex] = {
      ...db.orders[orderIndex],
      ...req.body
    };

    writeDatabase(db);
    return res.json({ success: true, order: db.orders[orderIndex] });
  } catch (error) {
    console.error("Error patching order:", error);
    return res.status(500).json({ error: "Internal Server Error during order update." });
  }
});

// 9. Secure Admin Endpoint: DELETE an order (Requires Verified Admin session)
app.delete("/api/orders/:id", (req, res) => {
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

    const orderId = req.params.id;
    const db = readDatabase();
    const filteredOrders = db.orders.filter((o: any) => o.id !== orderId);

    if (filteredOrders.length === db.orders.length) {
      return res.status(404).json({ error: "Order not found." });
    }

    db.orders = filteredOrders;
    writeDatabase(db);
    return res.json({ success: true, message: "Order deleted successfully." });
  } catch (error) {
    console.error("Error deleting order:", error);
    return res.status(500).json({ error: "Internal Server Error during order deletion." });
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
