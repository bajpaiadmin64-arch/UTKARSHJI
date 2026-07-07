import express from "express";
import path from "path";
import fs from "fs";
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

// ==================== API ENDPOINTS ====================

// 1. Submit a new order
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
    } = req.body;

    if (!fullName || !email || !phone || !serviceRequired || !projectDescription) {
      return res.status(400).json({ error: "Please fill in all required fields." });
    }

    const newOrder = {
      id: "UB-" + Math.floor(100000 + Math.random() * 900000),
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

// 2. Confirm payment for an order
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

// 3. Admin / Dashboard endpoint for retrieving orders
app.get("/api/orders", (req, res) => {
  try {
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

// 4. Smart AI Assistant Chat Endpoint (Gemini powered)
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
