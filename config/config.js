import admin from "firebase-admin";
import dotenv from "dotenv";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("../data/natkern-booking-firebase-adminsdk.json");

dotenv.config();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://natkern-booking-default-rtdb.firebaseio.com/",
});

export const db = admin.database();
export const bookingsRef = db.ref("bookings");

export const {
    WEBHOOK_VERIFY_TOKEN,
    GRAPH_API_TOKEN,
    BUSINESS_PHONE_NUMBER_ID,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    ADMIN_EMAIL,
} = process.env;
