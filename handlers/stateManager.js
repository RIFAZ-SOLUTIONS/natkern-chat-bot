import {bookingsRef, BUSINESS_PHONE_NUMBER_ID} from "../config/config.js";
import {sendBookingEmail} from "../services/emailService.js";
import {sendEventTypeList, sendRegionList, sendServicesTiles, sendTextMessage} from "./messageHandler.js";
import {saveBooking} from "../services/firebaseService.js";

export const userStates = {};

export const states = [
    { key: "customerName", prompt: "Please enter your full name:\nTafadhali ingiza jina lako kamili:" },
    { key: "customerPhone", prompt: "Please enter your phone number (Include country code, e.g., +255777111222):\nTafadhali ingiza namba yako ya simu (Mfano +255777111222)" },
    { key: "eventType", hasOthers: true },
    { key: "eventDate", prompt: "Please enter the event date (dd/mm/yyyy):\nTafadhali ingiza tarahe ya tukio (dd/mm/yyyy):" },
    { key: "eventRegion", hasOthers: true },
    { key: "eventLocation", prompt: "Please enter the event location:\nTafadhali ingiza eneo la tukio:" },
    { key: "services", hasOthers: true },
    { key: "duration", prompt: "Please enter the duration of the event (in hours or days):\nTafadhali ingiza urefu wa mda wa tukio (Mfano lisaa 1, siku 2, n.k):" },
    { key: "thanks", prompt: "Thank You for Choosing Natkern! We will get in touch with you promptly.\nAsante kwa kuchangua huduma za Natkern! Tutakurudia hivi punde." },
    { key: "eventDetails", prompt: "Please describe your event type:\nTafadhali eleza aina ya tukio:" }, // Triggered if "Others" is selected
    { key: "eventRegionDetails", prompt: "Please specify the region for your event:\nTafadhali elezea mkoa wa tukio:" }, // Triggered if "Others" is selected
    { key: "serviceDetails", prompt: "Please describe the services you need:\nTafadhali elezea aina ya huduma unayohitaji:" }, // Triggered if "Others" is selected
];

export const cancelState = {
    ENTER_PHONE: "enter_phone",
    SELECT_BOOKING: "select_booking",
};

export const handleNextState = async (userState, fromNumber) => {
    const nextState = states[userState.state];

    if (!nextState) {
        console.log("Booking completed.");
        await saveBooking(userState.data);
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
        } else if(nextState.key === "thanks"){
            await saveBooking(userState.data);
            await sendBookingEmail(userState.data);
            console.log("Sending prompt for thanks...");
            await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, nextState.prompt);
            userState.hasPrompted = true;
        }
        else if (nextState.prompt) {
            console.log("Sending prompt for next state...");
            await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, nextState.prompt);
            userState.hasPrompted = true;
        } else {
            console.error("No prompt or interactive message for this state");
        }
    } else {
        console.log('No prompt has been made.')
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
