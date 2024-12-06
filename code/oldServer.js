// import express from "express";
// import axios from "axios";
// import admin from "firebase-admin";
// import nodemailer from "nodemailer";
// import { createRequire } from 'module';
// import * as path from "node:path";
// import { dirname } from 'path';
// import { fileURLToPath } from 'url';
//
// const require = createRequire(import.meta.url);
//
// const __dirname = dirname(fileURLToPath(import.meta.url));
//
// const serviceAccount = require("./data/natkern-booking-firebase-adminsdk.json");
//
// const app = express();
// app.use(express.json());
//
// const {
//     WEBHOOK_VERIFY_TOKEN,
//     GRAPH_API_TOKEN,
//     BUSINESS_PHONE_NUMBER_ID,
//     SMTP_HOST,
//     SMTP_PORT,
//     SMTP_USER,
//     SMTP_PASS,
//     ADMIN_EMAIL,
// } = process.env;
//
// const eventTypes = [
//     { id: "corporate", title: "Corporate" },
//     { id: "sports", title: "Sports" },
//     { id: "religious", title: "Religious" },
//     { id: "wedding", title: "Wedding" },
//     { id: "conference", title: "Conference" },
//     { id: "exhibition", title: "Exhibition" },
//     { id: "others", title: "Others" },
// ];
//
// const regions = [
//     { id: "arusha", title: "Arusha" },
//     { id: "dar_es_salaam", title: "Dar es Salaam" },
//     { id: "dodoma", title: "Dodoma" },
//     { id: "geita", title: "Geita" },
//     { id: "iringa", title: "Iringa" },
//     { id: "kagera", title: "Kagera" },
//     { id: "katavi", title: "Katavi" },
//     { id: "kigoma", title: "Kigoma" },
//     { id: "kilimanjaro", title: "Kilimanjaro" },
//     { id: "lindi", title: "Lindi" },
//     { id: "manyara", title: "Manyara" },
//     { id: "mara", title: "Mara" },
//     { id: "mbeya", title: "Mbeya" },
//     { id: "morogoro", title: "Morogoro" },
//     { id: "mtwara", title: "Mtwara" },
//     { id: "mwanza", title: "Mwanza" },
//     { id: "njombe", title: "Njombe" },
//     { id: "rukwa", title: "Rukwa" },
//     { id: "ruvuma", title: "Ruvuma" },
//     { id: "shinyanga", title: "Shinyanga" },
//     { id: "simiyu", title: "Simiyu" },
//     { id: "singida", title: "Singida" },
//     { id: "tabora", title: "Tabora" },
//     { id: "tanga", title: "Tanga" },
//     { id: "zanzibar", title: "Zanzibar" },
//     { id: "pemba", title: "Pemba" },
//     { id: "others", title: "Others" },
// ];
//
// const services = [
//     { id: "led_screen", title: "LED Screen", description: "Rental/Hire LED Screen" },
//     { id: "sound_system", title: "Sound System", description: "Rental/Hire Sound/PA System" },
//     { id: "photography", title: "Photography", description: "Videography/Photography" },
//     { id: "stage", title: "Stage", description: "Rental/Hire Stage" },
//     { id: "led_posters", title: "LED Posters", description: "Rental/Hire LED Posters" },
//     { id: "tents", title: "Tents", description: "Rental/Hire Tents" },
//     { id: "graphics", title: "Graphics Design", description: "Graphics Design and Printing" },
//     { id: "others", title: "Others", description: "Specify the service" },
// ];
//
// const greetings = ["Hi", "Hello"];
//
//
// // Initialize Firebase
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://natkern-booking-default-rtdb.firebaseio.com/",
// });
//
// const db = admin.database();
// const bookingsRef = db.ref("bookings");
//
// const userStates = {};
//
// const states = [
//     { key: "customerName", prompt: "Please enter your full name:" },
//     { key: "customerPhone", prompt: "Please enter your phone number (Include country code, e.g., +255777111222):" },
//     { key: "eventType", hasOthers: true },
//     { key: "eventDate", prompt: "Please enter the event date (dd/mm/yyyy):" },
//     { key: "eventRegion", hasOthers: true },
//     { key: "eventLocation", prompt: "Please enter the event location:" },
//     { key: "services", hasOthers: true },
//     { key: "duration", prompt: "Please enter the duration of the event (in hours or days):" },
//     { key: "thanks", prompt: "Thank You for Choosing Natkern! We will get in touch with you promptly.:" },
//     { key: "eventDetails", prompt: "Please describe your event type:" }, // Triggered if "Others" is selected
//     { key: "eventRegionDetails", prompt: "Please specify the region for your event:" }, // Triggered if "Others" is selected
//     { key: "serviceDetails", prompt: "Please describe the services you need:" }, // Triggered if "Others" is selected
// ];
//
// const cancelState = {
//     ENTER_PHONE: "enter_phone",
//     SELECT_BOOKING: "select_booking",
// };
//
// const transporter = nodemailer.createTransport({
//     host: SMTP_HOST,
//     port: SMTP_PORT,
//     secure: false,
//     auth: {
//         user: SMTP_USER,
//         pass: SMTP_PASS,
//     },
// });
//
// // Function to send a confirmation email
// const sendBookingEmail = async (bookingDetails) => {
//     const {
//         customerName,
//         customerPhone,
//         eventType,
//         eventDate,
//         eventRegion,
//         eventLocation,
//         services,
//         duration,
//     } = bookingDetails;
//
//     const emailBody = `
//     <h1>New Booking Received</h1>
//     <p><strong>Name:</strong> ${customerName}</p>
//     <p><strong>Phone:</strong> ${customerPhone}</p>
//     <p><strong>Event Type:</strong> ${eventType}</p>
//     <p><strong>Event Date:</strong> ${eventDate}</p>
//     <p><strong>Event Region:</strong> ${eventRegion}</p>
//     <p><strong>Event Location:</strong> ${eventLocation}</p>
//     <p><strong>Requested Services:</strong> ${services}</p>
//     <p><strong>Duration:</strong> ${duration}</p>
//   `;
//
//     await transporter.sendMail({
//         from: SMTP_USER,
//         to: ADMIN_EMAIL,
//         subject: "New Booking",
//         html: emailBody,
//     });
// };
//
// // Handler for interactive menu
// const handleInteractiveMessage = async (fromNumber, selectedOption) => {
//     if (selectedOption === "menu_book") {
//         userStates[fromNumber] = { state: 0, data: {}, hasPrompted: false };
//         await handleNextState(userStates[fromNumber], fromNumber);
//     } else if (selectedOption === "menu_cancel") {
//         userStates[fromNumber] = { state: cancelState.ENTER_PHONE };
//         await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, "Please enter the phone number used for the booking:");
//     }
// };
//
// // Handler for text input
// const handleTextMessage = async (fromNumber, text) => {
//     const userState = userStates[fromNumber];
//
//     if (!userState) {
//         // No existing state, send the main menu
//         await sendInteractiveMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber);
//         return;
//     }
//
//     if (userState.state === cancelState.ENTER_PHONE) {
//         const contactNumber = text.trim();
//         await bookingsRef
//             .orderByChild("customerPhone")
//             .equalTo(contactNumber)
//             .once("value", (snapshot) => {
//                 const bookings = snapshot.val();
//                 if (bookings) {
//                     const bookingList = Object.entries(bookings)
//                         .map(([id, booking], index) => ({
//                             id,
//                             index: index + 1,
//                             ...booking,
//                         }))
//                         .map((b) => `*${b.index}.* Event Type: ${b.eventType}, Date: ${b.eventDate}`);
//                     sendTextMessage(
//                         BUSINESS_PHONE_NUMBER_ID,
//                         fromNumber,
//                         `Select a booking to cancel:\n\n${bookingList.join("\n")}`
//                     );
//                 } else {
//                     sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, "No bookings found for this phone number.");
//                 }
//             });
//         return;
//     }
//
//     const currentState = states[userState.state];
//
//     if (!currentState) {
//         console.log("Invalid state. Resetting and sending main menu...");
//         delete userStates[fromNumber];
//         await sendInteractiveMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber);
//         return;
//     }
//
//     if (!text || text.trim() === "") {
//         console.log("No input received. Waiting for user response...");
//         return;
//     }
//
//     switch (currentState.key) {
//         case "customerName":
//             userState.data.customerName = text.trim();
//             userState.state++;
//             userState.hasPrompted = false;
//             await handleNextState(userState, fromNumber);
//             break;
//
//         case "customerPhone":
//             if (validateInput("customerPhone", text)) {
//                 userState.data.customerPhone = text.trim();
//                 userState.state++;
//                 userState.hasPrompted = false;
//                 await handleNextState(userState, fromNumber);
//             } else {
//                 await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, currentState.prompt);
//             }
//             break;
//
//         case "eventType":
//             if (!userState.hasPrompted) {
//                 await sendEventTypeList(BUSINESS_PHONE_NUMBER_ID, fromNumber);
//                 userState.hasPrompted = true;
//                 return;
//             }
//
//             const selectedEventType = eventTypes.find((event) => event.id === text);
//
//             if (selectedEventType) {
//                 userState.data.eventType = selectedEventType.title;
//
//                 if (selectedEventType.id === "others") {
//                     userState.state++;
//                     userState.hasPrompted = false;
//                     const nextState = states[userState.state];
//                     if (nextState?.prompt) {
//                         await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, nextState.prompt);
//                     }
//                 } else {
//                     userState.state++;
//                     userState.hasPrompted = false;
//                     await handleNextState(userState, fromNumber);
//                 }
//             } else {
//                 await sendEventTypeList(BUSINESS_PHONE_NUMBER_ID, fromNumber);
//             }
//             break;
//
//         case "eventDate":
//             if (validateInput("eventDate", text)) {
//                 userState.data.eventDate = text.trim();
//                 userState.state++;
//                 userState.hasPrompted = false;
//                 await handleNextState(userState, fromNumber);
//             } else {
//                 await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, currentState.prompt);
//             }
//             break;
//
//         case "eventRegion":
//             if (!userState.hasPrompted) {
//                 userState.currentRegionPage = 0;
//                 await sendRegionList(BUSINESS_PHONE_NUMBER_ID, fromNumber);
//                 userState.hasPrompted = true;
//                 return;
//             }
//
//             const selectedId = text;
//
//             if (selectedId.startsWith("more_")) {
//                 // Extract the next page number
//                 userState.currentRegionPage = parseInt(selectedId.split("_")[1]);
//                 await sendRegionList(BUSINESS_PHONE_NUMBER_ID, fromNumber, userState.currentRegionPage);
//                 return;
//             }
//
//             const selectedRegion = text;
//
//             if (selectedRegion) {
//                 userState.data.eventRegion = selectedRegion.title;
//                 userState.state++;
//                 userState.hasPrompted = false;
//                 delete userState.currentRegionPage;
//
//                 if (selectedRegion.id === "others") {
//                     // Handle "Others" option
//                     const nextState = states[userState.state];
//                     if (nextState?.prompt) {
//                         await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, nextState.prompt);
//                         userState.hasPrompted = true;
//                     }
//                 } else {
//                     await handleNextState(userState, fromNumber);
//                 }
//             } else {
//                 // Invalid selection, re-send the current page
//                 await sendRegionList(BUSINESS_PHONE_NUMBER_ID, fromNumber, userState.currentRegionPage);
//             }
//             break;
//
//         case "eventLocation":
//             userState.data.eventLocation = text.trim();
//             userState.state++;
//             userState.hasPrompted = false;
//             await handleNextState(userState, fromNumber);
//             break;
//
//         case "services":
//             if (!userState.hasPrompted) {
//                 await sendServicesTiles(BUSINESS_PHONE_NUMBER_ID, fromNumber);
//                 userState.hasPrompted = true;
//                 return;
//             }
//
//             const selectedService = services.find((service) => service.id === text);
//
//             if (selectedService) {
//                 userState.data.services = selectedService.title;
//
//                 if (selectedService.id === "others") {
//                     userState.state++;
//                     userState.hasPrompted = false;
//                     const nextState = states[userState.state];
//                     if (nextState?.prompt) {
//                         await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, nextState.prompt);
//                     }
//                 } else {
//                     userState.state++;
//                     userState.hasPrompted = false;
//                     await handleNextState(userState, fromNumber);
//                 }
//             } else {
//                 await sendServicesTiles(BUSINESS_PHONE_NUMBER_ID, fromNumber);
//             }
//             break;
//
//         case "duration":
//             userState.data.duration = text.trim();
//             userState.state++;
//             userState.hasPrompted = false;
//             await handleNextState(userState, fromNumber);
//             break;
//
//         case "thanks":
//             userState.data.duration = text.trim();
//             delete userState.state;
//             userState.hasPrompted = false;
//             await handleNextState(userState, fromNumber);
//             break;
//
//         case "eventDetails":
//         case "eventRegionDetails":
//         case "serviceDetails":
//             userState.data[currentState.key] = text.trim();
//             userState.state++;
//             await handleNextState(userState, fromNumber);
//             break;
//
//         default:
//             if (validateInput(currentState.key, text)) {
//                 userState.data[currentState.key] = text.trim();
//                 userState.state++;
//                 await handleNextState(userState, fromNumber);
//             } else {
//                 await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, `Invalid input. ${currentState.prompt}`);
//             }
//             break;
//     }
// };
//
// // Input validation function
// const validateInput = (state, input) => {
//     switch (state) {
//         case "customerPhone":
//             const sanitizedInput = input.trim().replace(/\s+/g, "");
//             return /^\+\d{10,15}$/.test(sanitizedInput);
//         case "eventDate":
//             return /^\d{2}\/\d{2}\/\d{4}$/.test(input.trim());
//         default:
//             return input.length > 0;
//     }
// };
//
// // WhatsApp interactive message
// const sendInteractiveMessage = async (businessPhoneNumberId, to) => {
//     const payload = {
//         type: "interactive",
//         interactive: {
//             type: "list",
//             body: {
//                 text: "Welcome! What would you like to do?",
//             },
//             action: {
//                 button: "Options",
//                 sections: [
//                     {
//                         title: "Main Menu",
//                         rows: [
//                             { id: "menu_book", title: "Book Services", description: "Make a new booking" },
//                             { id: "menu_cancel", title: "Cancel Booking", description: "Cancel an existing booking" },
//                         ],
//                     },
//                 ],
//             },
//         },
//     };
//
//     await sendWhatsAppMessage(businessPhoneNumberId, to, payload);
// };
//
// const sendEventTypeList = async (businessPhoneNumberId, to) => {
//     const sections = [
//         {
//             title: "Event Types",
//             rows: eventTypes.map((eventType) => ({
//                 id: eventType.id,
//                 title: eventType.title,
//             })),
//         },
//     ];
//
//     const payload = {
//         type: "interactive",
//         interactive: {
//             type: "list",
//             body: {
//                 text: "Please select the type of event:",
//             },
//             action: {
//                 button: "Event Types",
//                 sections,
//             },
//         },
//     };
//
//     await sendWhatsAppMessage(businessPhoneNumberId, to, payload);
// };
//
// // const sendRegionList = async (businessPhoneNumberId, to) => {
// //   const sections = [
// //     {
// //       title: "Regions",
// //       rows: regions.map((region) => ({
// //         id: region.id,
// //         title: region.title,
// //       })),
// //     },
// //   ];
//
// //   const payload = {
// //     type: "interactive",
// //     interactive: {
// //       type: "list",
// //       body: { text: "Please select the region for the event:" },
// //       action: { button: "Regions", sections },
// //     },
// //   };
//
// //   await sendWhatsAppMessage(businessPhoneNumberId, to, payload);
// // };
//
// const sendRegionList = async (businessPhoneNumberId, to, page = 0) => {
//     const regionsPerPage = 9; // We'll use the 10th slot for "More"
//     const startIndex = page * regionsPerPage;
//     const endIndex = startIndex + regionsPerPage;
//     const regionsPage = regions.slice(startIndex, endIndex);
//
//     // Map regions to rows
//     const rows = regionsPage.map((region) => ({
//         id: region.id,
//         title: region.title,
//     }));
//
//     // Check if there are more regions
//     const hasMore = endIndex < regions.length;
//
//     // Add "More" option if there are more regions
//     if (hasMore) {
//         rows.push({
//             id: `more_${page + 1}`,
//             title: "More",
//         });
//     }
//
//     const sections = [
//         {
//             title: `Regions (${startIndex + 1}-${Math.min(endIndex, regions.length)})`,
//             rows,
//         },
//     ];
//
//     const payload = {
//         type: "interactive",
//         interactive: {
//             type: "list",
//             body: { text: "Please select the region for the event:" },
//             action: { button: "Regions", sections },
//         },
//     };
//
//     await sendWhatsAppMessage(businessPhoneNumberId, to, payload);
// };
//
//
//
// const sendServicesTiles = async (businessPhoneNumberId, to) => {
//     const sections = [
//         {
//             title: "Available Services",
//             rows: services.map((service) => ({
//                 id: service.id,
//                 title: service.title,
//                 description: service.description,
//             })),
//         },
//     ];
//
//     const payload = {
//         type: "interactive",
//         interactive: {
//             type: "list",
//             body: { text: "Please select the services you need:" },
//             action: { button: "Services", sections },
//         },
//     };
//
//     await sendWhatsAppMessage(businessPhoneNumberId, to, payload);
// };
//
// // WhatsApp text message
// const sendTextMessage = async (businessPhoneNumberId, to, body) => {
//     await sendWhatsAppMessage(businessPhoneNumberId, to, {
//         type: "text",
//         text: { body },
//     });
// };
//
// const sendWhatsAppMessage = async (businessPhoneNumberId, to, messagePayload) => {
//     const payload = {
//         messaging_product: "whatsapp",
//         to,
//         ...messagePayload,
//     };
//
//     try {
//         const response = await axios.post(
//             `https://graph.facebook.com/v17.0/${businessPhoneNumberId}/messages`,
//             payload,
//             {
//                 headers: {
//                     Authorization: `Bearer ${GRAPH_API_TOKEN}`,
//                     "Content-Type": "application/json",
//                 },
//             }
//         );
//         console.log("Message sent successfully:", response.data);
//     } catch (error) {
//         console.error("Error sending message:", error.response?.data || error.message);
//     }
// };
//
// // const handleNextState = async (userState, fromNumber) => {
// //   const nextState = states[userState.state];
//
// //   if (!nextState) {
// //     console.log("Booking completed.");
// //     bookingsRef.push(userState.data);
// //     await sendBookingEmail(userState.data);
// //     await sendTextMessage(
// //       BUSINESS_PHONE_NUMBER_ID,
// //       fromNumber,
// //       `Booking confirmed! Details:\n\n${JSON.stringify(userState.data, null, 2)}`
// //     );
// //     delete userStates[fromNumber];
// //     return;
// //   }
//
// //   if (nextState.key === "eventType") {
// //     await sendEventTypeList(BUSINESS_PHONE_NUMBER_ID, fromNumber);
// //   } else if (nextState.key === "eventRegion") {
// //     await sendRegionList(BUSINESS_PHONE_NUMBER_ID, fromNumber);
// //   } else if (nextState.key === "services") {
// //     await sendServicesTiles(BUSINESS_PHONE_NUMBER_ID, fromNumber);
// //   } else if (nextState.prompt) {
// //     await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, nextState.prompt);
// //   } else {
// //     console.error("No prompt or interactive message for this state");
// //   }
// // };
//
// const handleNextState = async (userState, fromNumber) => {
//     const nextState = states[userState.state];
//
//     if (!nextState) {
//         console.log("Booking completed.");
//         bookingsRef.push(userState.data);
//         await sendBookingEmail(userState.data);
//         await sendTextMessage(
//             BUSINESS_PHONE_NUMBER_ID,
//             fromNumber,
//             `Booking confirmed! Details:\n\n${JSON.stringify(userState.data, null, 2)}`
//         );
//         delete userStates[fromNumber];
//         return;
//     }
//
//     if (!userState.hasPrompted) {
//         if (nextState.key === "eventType") {
//             console.log("Sending event type list...");
//             await sendEventTypeList(BUSINESS_PHONE_NUMBER_ID, fromNumber);
//             userState.hasPrompted = true;
//         } else if (nextState.key === "eventRegion") {
//             console.log("Sending event region list...");
//             await sendRegionList(BUSINESS_PHONE_NUMBER_ID, fromNumber);
//             userState.hasPrompted = true;
//         } else if (nextState.key === "services") {
//             console.log("Sending services list...");
//             await sendServicesTiles(BUSINESS_PHONE_NUMBER_ID, fromNumber);
//             userState.hasPrompted = true;
//         } else if (nextState.prompt) {
//             console.log("Sending prompt for next state...");
//             await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, nextState.prompt);
//             userState.hasPrompted = true;
//         } else {
//             console.error("No prompt or interactive message for this state");
//         }
//     } else {
//         console.log("User has already been prompted for this state.");
//     }
// };
//
//
// app.post("/webhook", async (req, res) => {
//     console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));
//
//     const entry = req.body.entry?.[0];
//     if (!entry) return res.sendStatus(400);
//
//     const change = entry.changes?.[0];
//     if (!change) return res.sendStatus(400);
//
//     const message = change.value.messages?.[0];
//     if (message) {
//         const fromNumber = message.from;
//
//         // Check if the message is from a group chat
//         if (message.participant) {
//             console.log("Ignoring message from group chat");
//             return res.sendStatus(200); // Ignore group messages
//         }
//
//         if (message.type === "interactive") {
//             const interactiveType = message.interactive.type;
//             const interactiveData = message.interactive[interactiveType];
//
//             const text = interactiveData.id; // Extract the 'id' of the selected option
//
//             if (text === "menu_book" || text === "menu_cancel") {
//                 await handleInteractiveMessage(fromNumber, text);
//             } else {
//                 await handleTextMessage(fromNumber, text);
//             }
//         } else if (message.type === "text") {
//             const text = message.text.body;
//             if (greetings.includes(text.trim())) {
//                 await sendInteractiveMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber);
//             } else {
//                 await handleTextMessage(fromNumber, text);
//             }
//         } else {
//             await sendInteractiveMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber);
//         }
//     } else {
//         // Handle status updates
//         const status = change.value.statuses?.[0];
//         if (status) {
//             console.log(`Status update for message ID ${status.id}: ${status.status}`);
//         }
//     }
//
//     res.sendStatus(200);
// });
//
// app.get("/webhook", (req, res) => {
//     const mode = req.query["hub.mode"];
//     const token = req.query["hub.verify_token"];
//     const challenge = req.query["hub.challenge"];
//
//     if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
//         res.status(200).send(challenge);
//         console.log("Webhook verified successfully!");
//     } else {
//         res.sendStatus(403);
//     }
// });
//
// app.get("/", (req, res) => {
//     res.send(`<pre>Nothing to see here.
// Checkout README.md to start.</pre>`);
// });
//
// app.get("/privacy", (req, res) => {
//     const filePath = path.resolve(__dirname, 'views', 'privacy.html');
//     res.sendFile(filePath);
// });
//
// // Start the server
// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });
