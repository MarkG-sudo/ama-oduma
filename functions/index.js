const functions = require("firebase-functions/v2");
const { onInit } = require("firebase-functions/v2/core");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// ✅ Define secrets for Secret Manager
const paystackSecret = defineSecret("PAYSTACK_SECRET");
const sendgridKey = defineSecret("SENDGRID_KEY");

// Variables that will be initialized
let db;
let isInitialized = false;
let customerTemplate, adminTemplate;

// ✅ Use onInit() to defer initialization
onInit(() => {
    console.log("Initializing Firebase app and services...");

    // Initialize Firebase Admin
    if (admin.apps.length === 0) {
        admin.initializeApp();
    }
    db = admin.firestore();

    // ✅ Load email templates (CSS is now embedded in HTML files)
    try {
        const templatesPath = path.join(__dirname, 'email-templates');
        customerTemplate = fs.readFileSync(path.join(templatesPath, 'customer-receipt.html'), 'utf8');
        adminTemplate = fs.readFileSync(path.join(templatesPath, 'admin-notification.html'), 'utf8');
        console.log("✅ Email templates loaded successfully");
    } catch (error) {
        console.error("❌ Error loading email templates:", error);
        // Fallback to basic templates if files not found
        customerTemplate = `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
                <h2>Thank you for your order!</h2>
                <p>Your payment has been confirmed.</p>
                <p><strong>Reference:</strong> {{reference}}</p>
                <div>{{orderItems}}</div>
                <p style="font-weight: bold; text-align: right; margin-top: 15px;">Total Paid: GHS {{totalAmount}}</p>
            </div>
        `;
        adminTemplate = `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px;">
                <h2>New Order Alert</h2>
                <p><strong>Customer:</strong> {{customerEmail}}</p>
                <p><strong>Reference:</strong> {{reference}}</p>
                <div>{{orderItems}}</div>
                <p style="font-weight: bold; text-align: right; margin-top: 15px;">Total Amount: GHS {{totalAmount}}</p>
            </div>
        `;
    }

    isInitialized = true;
    console.log("Initialization complete!");
});

// ✅ Simplified helper function to render email templates
function renderTemplate(template, data) {
    let html = template;

    // Replace all placeholders with actual data
    Object.keys(data).forEach(key => {
        const placeholder = `{{${key}}}`;
        html = html.split(placeholder).join(data[key]);
    });

    return html;
}

// ✅ Helper function to generate order items HTML
function generateOrderItems(cart) {
    return cart.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
            <span>${item.name} × ${item.qty}</span>
            <span>GHS ${(item.price * item.qty).toFixed(2)}</span>
        </div>
    `).join('');
}

// Paystack webhook function with secrets
exports.paystackWebhook = functions.https.onRequest(
    {
        region: "europe-west1",
        secrets: [paystackSecret, sendgridKey],
        cors: true,
        timeoutSeconds: 60,
        preserveRawBody: true
    },
    async (req, res) => {
        // ✅ Wait for initialization if needed
        if (!isInitialized) {
            return res.status(503).send("Service initializing, please try again in a moment");
        }

        // Set CORS headers
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Methods", "GET, POST");
        res.set("Access-Control-Allow-Headers", "Content-Type");

        // Handle preflight request
        if (req.method === "OPTIONS") {
            return res.status(204).send("");
        }

        // ✅ ADD REQUEST ID FOR TRACKING
        const requestId = Date.now() + Math.random().toString(36).substring(2, 9);
        console.log(`=== WEBHOOK REQUEST ${requestId} START ===`);

        try {
            // ✅ Access secrets INSIDE the function using .value()
            const secret = paystackSecret.value();
            sgMail.setApiKey(sendgridKey.value());

            // ✅ COMPREHENSIVE DEBUGGING
            console.log(`[${requestId}] Secret loaded:`, !!secret);
            console.log(`[${requestId}] Has rawBody:`, !!req.rawBody);
            console.log(`[${requestId}] Has x-paystack-signature:`, !!req.headers["x-paystack-signature"]);
            console.log(`[${requestId}] Request method:`, req.method);
            console.log(`[${requestId}] Request URL:`, req.url);

            if (!req.rawBody) {
                console.error(`[${requestId}] No rawBody available`);
                return res.status(400).send("Missing request body");
            }

            const rawBody = req.rawBody.toString();
            const signature = req.headers["x-paystack-signature"];

            console.log(`[${requestId}] Raw body length:`, rawBody.length);
            console.log(`[${requestId}] Raw body (first 200 chars):`, rawBody.substring(0, 200));

            // Verify Paystack signature using RAW body
            const hash = crypto
                .createHmac("sha512", secret)
                .update(rawBody)
                .digest("hex");

            console.log(`[${requestId}] Calculated hash:`, hash);
            console.log(`[${requestId}] Received signature:`, signature);

            if (hash !== signature) {
                console.error(`[${requestId}] ❌ SIGNATURE MISMATCH`);
                console.error(`[${requestId}] Hashes equal:`, hash === signature);

                // Return error immediately
                return res.status(400).send("Invalid signature");
            }

            console.log(`[${requestId}] ✅ Signature verified successfully!`);

            // ✅ Now parse the raw body to get the event data
            const event = JSON.parse(rawBody);
            console.log(`[${requestId}] Received Paystack event:`, event.event);

            if (event.event === "charge.success") {
                const data = event.data;
                console.log(`[${requestId}] Processing charge.success for:`, data.customer.email);
                console.log(`[${requestId}] Reference:`, data.reference);

                // Parse cart metadata
                let cart = [];
                try {
                    if (data.metadata && data.metadata.custom_fields) {
                        cart = JSON.parse(data.metadata.custom_fields[0].value);
                        console.log(`[${requestId}] Cart parsed:`, cart.length, "items");
                    }
                } catch (parseError) {
                    console.error(`[${requestId}] Error parsing cart:`, parseError);
                    return res.status(400).send("Invalid cart data");
                }

                // Save order in Firestore
                const orderData = {
                    email: data.customer.email,
                    amount: data.amount / 100,
                    reference: data.reference,
                    status: data.status,
                    cart: cart,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                };

                await db.collection("orders").add(orderData);
                console.log(`[${requestId}] ✅ Order saved to Firestore`);

                // ✅ DEBUG: Check if templates are loading correctly
                console.log(`[${requestId}] === EMAIL TEMPLATE DEBUG ===`);
                console.log(`[${requestId}] Customer template exists:`, !!customerTemplate);
                console.log(`[${requestId}] Admin template exists:`, !!adminTemplate);

                if (customerTemplate) {
                    console.log(`[${requestId}] Customer template length:`, customerTemplate.length);
                    console.log(`[${requestId}] Customer template first 200 chars:`, customerTemplate.substring(0, 200));
                } else {
                    console.log(`[${requestId}] ❌ Customer template is NULL/undefined`);
                }

                if (adminTemplate) {
                    console.log(`[${requestId}] Admin template length:`, adminTemplate.length);
                    console.log(`[${requestId}] Admin template first 200 chars:`, adminTemplate.substring(0, 200));
                } else {
                    console.log(`[${requestId}] ❌ Admin template is NULL/undefined`);
                }

                // Check if templates directory exists and what files are there
                try {
                    const templatesPath = path.join(__dirname, 'email-templates');
                    const files = fs.readdirSync(templatesPath);
                    console.log(`[${requestId}] Files in email-templates directory:`, files);
                } catch (error) {
                    console.log(`[${requestId}] ❌ Cannot read email-templates directory:`, error.message);
                }

                // ✅ Generate order items HTML for email templates
                const orderItemsHtml = generateOrderItems(cart);
                const totalAmount = (data.amount / 100).toFixed(2);

                // ✅ Send professional email receipts using templates
                const customerEmailData = {
                    customerName: data.customer.email.split('@')[0],
                    reference: data.reference,
                    totalAmount: totalAmount,
                    orderItems: orderItemsHtml
                };

                const adminEmailData = {
                    customerEmail: data.customer.email,
                    reference: data.reference,
                    totalAmount: totalAmount,
                    orderItems: orderItemsHtml
                };


                // ✅ DEBUG: Check if templates are loaded
                console.log(`[${requestId}] Customer template loaded:`, !!customerTemplate);
                console.log(`[${requestId}] Admin template loaded:`, !!adminTemplate);
                console.log(`[${requestId}] Customer template length:`, customerTemplate?.length);
                console.log(`[${requestId}] Admin template length:`, adminTemplate?.length);

                // ✅ DEBUG: Check rendered templates
                const renderedCustomer = renderTemplate(customerTemplate, customerEmailData);
                const renderedAdmin = renderTemplate(adminTemplate, adminEmailData);

                console.log(`[${requestId}] Rendered customer email length:`, renderedCustomer.length);
                console.log(`[${requestId}] Rendered admin email length:`, renderedAdmin.length);
                console.log(`[${requestId}] Rendered customer email preview:`, renderedCustomer.substring(0, 200));
                console.log(`[${requestId}] Rendered admin email preview:`, renderedAdmin.substring(0, 200));

                const customerMsg = {
                    to: data.customer.email,
                    from: "orders@amaoduma.store",
                    subject: "Ama Oduma - Order Confirmation 🎉",
                    html: renderTemplate(customerTemplate, customerEmailData),
                };

                const teamMsg = {
                    to: "amaodumagh@gmail.com",
                    from: "orders@amaoduma.store",
                    subject: `🚨 New Order - ${data.customer.email}`,
                    html: renderTemplate(adminTemplate, adminEmailData),
                };

                await sgMail.send(customerMsg);
                await sgMail.send(teamMsg);
                console.log(`[${requestId}] ✅ Professional emails sent successfully`);

                console.log(`[${requestId}] === WEBHOOK REQUEST COMPLETED SUCCESSFULLY ===`);
                return res.status(200).json({
                    status: "success",
                    message: "Order processed successfully"
                });
            }

            console.log(`[${requestId}] Event ignored:`, event.event);
            return res.status(200).json({ status: "ignored" });
        } catch (err) {
            console.error(`[${requestId}] Webhook error:`, err);
            return res.status(500).send("Webhook processing error");
        }
    }
);

// Simple test function
exports.helloWorld = functions.https.onRequest(
    { region: "europe-west1" },
    (req, res) => {
        if (!isInitialized) {
            return res.status(503).send("Service initializing");
        }
        res.json({ message: "Hello from Firebase!", timestamp: new Date() });
    }
);