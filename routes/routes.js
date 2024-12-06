import { handleTextMessage, handleInteractiveMessage } from "../handlers/messageHandler.js";
import * as path from "node:path";
import {WEBHOOK_VERIFY_TOKEN} from "../config/config.js";


export default (app) => {
    app.post("/webhook", async (req, res) => {
        console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));

        const entry = req.body.entry?.[0];
        if (!entry) return res.sendStatus(400);

        const change = entry.changes?.[0];
        if (!change) return res.sendStatus(400);

        const message = change.value.messages?.[0];
        if (message) {
            const fromNumber = message.from;

            // Check if the message is from a group chat
            if (message.participant) {
                console.log("Ignoring message from group chat");
                return res.sendStatus(200); // Ignore group messages
            }

            if (message.type === "interactive") {
                const interactiveType = message.interactive.type;
                const interactiveData = message.interactive[interactiveType];

                const text = interactiveData.id; // Extract the 'id' of the selected option

                if (text === "menu_book" || text === "menu_cancel") {
                    await handleInteractiveMessage(fromNumber, text);
                } else {
                    await handleTextMessage(fromNumber, text);
                }
            } else if (message.type === "text") {
                const text = message.text.body;
                if (greetings.includes(text.trim())) {
                    await sendInteractiveMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber);
                } else {
                    await handleTextMessage(fromNumber, text);
                }
            } else {
                await sendInteractiveMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber);
            }
        } else {
            // Handle status updates
            const status = change.value.statuses?.[0];
            if (status) {
                console.log(`Status update for message ID ${status.id}: ${status.status}`);
            }
        }

        res.sendStatus(200);
    });

    app.get("/webhook", (req, res) => {
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
            res.status(200).send(challenge);
            console.log("Webhook verified successfully!");
        } else {
            res.sendStatus(403);
        }
    });

    app.get("/", (req, res) => {
        res.send(`<pre>Nothing to see here.
        Checkout README.md to start.</pre>`);
    });

    app.get("/privacy", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../views/privacy.html"));
    });
};