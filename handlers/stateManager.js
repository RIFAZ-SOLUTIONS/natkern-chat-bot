import {bookingsRef, BUSINESS_PHONE_NUMBER_ID} from "../config/config.js";
import {sendBookingEmail} from "../services/emailService.js";
import {sendEventTypeList, sendRegionList, sendServicesTiles, sendTextMessage} from "./messageHandler.js";

export const userStates = {};

export const states = [
    { key: "customerName", prompt: "Please enter your full name:" },
    { key: "customerPhone", prompt: "Please enter your phone number (Include country code, e.g., +255777111222):" },
    { key: "eventType", hasOthers: true },
    { key: "eventDate", prompt: "Please enter the event date (dd/mm/yyyy):" },
    { key: "eventRegion", hasOthers: true },
    { key: "eventLocation", prompt: "Please enter the event location:" },
    { key: "services", hasOthers: true },
    { key: "duration", prompt: "Please enter the duration of the event (in hours or days):" },
    { key: "thanks", prompt: "Thank You for Choosing Natkern! We will get in touch with you promptly.:" },
    { key: "eventDetails", prompt: "Please describe your event type:" }, // Triggered if "Others" is selected
    { key: "eventRegionDetails", prompt: "Please specify the region for your event:" }, // Triggered if "Others" is selected
    { key: "serviceDetails", prompt: "Please describe the services you need:" }, // Triggered if "Others" is selected
];

export const cancelState = {
    ENTER_PHONE: "enter_phone",
    SELECT_BOOKING: "select_booking",
};

export const handleNextState = async (userState, fromNumber) => {
    const nextState = states[userState.state];

    if (!nextState) {
        console.log("Booking completed.");
        bookingsRef.push(userState.data);
        await sendBookingEmail(userState.data);
        await sendTextMessage(
            BUSINESS_PHONE_NUMBER_ID,
            fromNumber,
            `Booking confirmed! Details:\n\n${JSON.stringify(userState.data, null, 2)}`
        );
        delete userStates[fromNumber];
        return;
    }

    if (!userState.hasPrompted) {
        if (nextState.key === "eventType") {
            console.log("Sending event type list...");
            await sendEventTypeList(BUSINESS_PHONE_NUMBER_ID, fromNumber);
            userState.hasPrompted = true;
        } else if (nextState.key === "eventRegion") {
            console.log("Sending event region list...");
            await sendRegionList(BUSINESS_PHONE_NUMBER_ID, fromNumber);
            userState.hasPrompted = true;
        } else if (nextState.key === "services") {
            console.log("Sending services list...");
            await sendServicesTiles(BUSINESS_PHONE_NUMBER_ID, fromNumber);
            userState.hasPrompted = true;
        } else if (nextState.prompt) {
            console.log("Sending prompt for next state...");
            await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, nextState.prompt);
            userState.hasPrompted = true;
        } else {
            console.error("No prompt or interactive message for this state");
        }
    } else {
        console.log("User has already been prompted for this state.");
    }
};

export const validateInput = (state, input) => {
    switch (state) {
        case "customerPhone":
            const sanitizedInput = input.trim().replace(/\s+/g, "");
            return /^\+\d{10,15}$/.test(sanitizedInput);
        case "eventDate":
            return /^\d{2}\/\d{2}\/\d{4}$/.test(input.trim());
        default:
            return input.length > 0;
    }
};
