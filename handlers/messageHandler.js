import axios from "axios";
import {GRAPH_API_TOKEN, BUSINESS_PHONE_NUMBER_ID, bookingsRef} from "../config/config.js";
import { eventTypes, regions, services } from "../config/constants.js";
import {cancelState, handleNextState, states, userStates, validateInput} from "./stateManager.js";

export const handleInteractiveMessage = async (fromNumber, selectedOption) => {
    if (selectedOption === "menu_book") {
        userStates[fromNumber] = { state: 0, data: {}, hasPrompted: false };
        await handleNextState(userStates[fromNumber], fromNumber);
    } else if (selectedOption === "menu_cancel") {
        userStates[fromNumber] = { state: cancelState.ENTER_PHONE };
        await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, "Please enter the phone number used for the booking:");
    }
};

export const handleTextMessage = async (fromNumber, text) => {
    const userState = userStates[fromNumber];

    if (!userState) {
        // No existing state, send the main menu
        await sendInteractiveMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber);
        return;
    }

    if (userState.state === cancelState.ENTER_PHONE) {
        const contactNumber = text.trim();
        await bookingsRef
            .orderByChild("customerPhone")
            .equalTo(contactNumber)
            .once("value", (snapshot) => {
                const bookings = snapshot.val();
                if (bookings) {
                    const bookingList = Object.entries(bookings)
                        .map(([id, booking], index) => ({
                            id,
                            index: index + 1,
                            ...booking,
                        }))
                        .map((b) => `*${b.index}.* Event Type: ${b.eventType}, Date: ${b.eventDate}`);
                    sendTextMessage(
                        BUSINESS_PHONE_NUMBER_ID,
                        fromNumber,
                        `Select a booking to cancel:\n\n${bookingList.join("\n")}`
                    );
                } else {
                    sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, "No bookings found for this phone number.");
                }
            });
        return;
    }

    const currentState = states[userState.state];

    if (!currentState) {
        console.log("Invalid state. Resetting and sending main menu...");
        delete userStates[fromNumber];
        await sendInteractiveMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber);
        return;
    }

    if (!text || text.trim() === "") {
        console.log("No input received. Waiting for user response...");
        return;
    }

    switch (currentState.key) {
        case "customerName":
            userState.data.customerName = text.trim();
            userState.state++;
            userState.hasPrompted = false;
            await handleNextState(userState, fromNumber);
            break;

        case "customerPhone":
            if (validateInput("customerPhone", text)) {
                userState.data.customerPhone = text.trim();
                userState.state++;
                userState.hasPrompted = false;
                await handleNextState(userState, fromNumber);
            } else {
                await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, currentState.prompt);
            }
            break;

        case "eventType":
            if (!userState.hasPrompted) {
                await sendEventTypeList(BUSINESS_PHONE_NUMBER_ID, fromNumber);
                userState.hasPrompted = true;
                return;
            }

            const selectedEventType = eventTypes.find((event) => event.id === text);

            if (selectedEventType) {
                userState.data.eventType = selectedEventType.title;

                if (selectedEventType.id === "others") {
                    userState.state++;
                    userState.hasPrompted = false;
                    const nextState = states[userState.state];
                    if (nextState?.prompt) {
                        await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, nextState.prompt);
                    }
                } else {
                    userState.state++;
                    userState.hasPrompted = false;
                    await handleNextState(userState, fromNumber);
                }
            } else {
                await sendEventTypeList(BUSINESS_PHONE_NUMBER_ID, fromNumber);
            }
            break;

        case "eventDate":
            if (validateInput("eventDate", text)) {
                userState.data.eventDate = text.trim();
                userState.state++;
                userState.hasPrompted = false;
                await handleNextState(userState, fromNumber);
            } else {
                await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, currentState.prompt);
            }
            break;

        case "eventRegion":
            if (!userState.hasPrompted) {
                userState.currentRegionPage = 0;
                await sendRegionList(BUSINESS_PHONE_NUMBER_ID, fromNumber);
                userState.hasPrompted = true;
                return;
            }

            const selectedId = text;

            if (selectedId.startsWith("more_")) {
                // Extract the next page number
                userState.currentRegionPage = parseInt(selectedId.split("_")[1]);
                await sendRegionList(BUSINESS_PHONE_NUMBER_ID, fromNumber, userState.currentRegionPage);
                return;
            }

            const selectedRegion = text;

            if (selectedRegion) {
                userState.data.eventRegion = selectedRegion.title;
                userState.state++;
                userState.hasPrompted = false;
                delete userState.currentRegionPage;

                if (selectedRegion.id === "others") {
                    // Handle "Others" option
                    const nextState = states[userState.state];
                    if (nextState?.prompt) {
                        await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, nextState.prompt);
                        userState.hasPrompted = true;
                    }
                } else {
                    await handleNextState(userState, fromNumber);
                }
            } else {
                // Invalid selection, re-send the current page
                await sendRegionList(BUSINESS_PHONE_NUMBER_ID, fromNumber, userState.currentRegionPage);
            }
            break;

        case "eventLocation":
            userState.data.eventLocation = text.trim();
            userState.state++;
            userState.hasPrompted = false;
            await handleNextState(userState, fromNumber);
            break;

        case "services":
            if (!userState.hasPrompted) {
                await sendServicesTiles(BUSINESS_PHONE_NUMBER_ID, fromNumber);
                userState.hasPrompted = true;
                return;
            }

            const selectedService = services.find((service) => service.id === text);

            if (selectedService) {
                userState.data.services = selectedService.title;

                if (selectedService.id === "others") {
                    userState.state++;
                    userState.hasPrompted = false;
                    const nextState = states[userState.state];
                    if (nextState?.prompt) {
                        await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, nextState.prompt);
                    }
                } else {
                    userState.state++;
                    userState.hasPrompted = false;
                    await handleNextState(userState, fromNumber);
                }
            } else {
                await sendServicesTiles(BUSINESS_PHONE_NUMBER_ID, fromNumber);
            }
            break;

        case "duration":
            userState.data.duration = text.trim();
            userState.state++;
            userState.hasPrompted = false;
            await handleNextState(userState, fromNumber);
            break;

        case "thanks":
            userState.data.duration = text.trim();
            delete userState.state;
            userState.hasPrompted = false;
            await handleNextState(userState, fromNumber);
            break;

        case "eventDetails":
        case "eventRegionDetails":
        case "serviceDetails":
            userState.data[currentState.key] = text.trim();
            userState.state++;
            await handleNextState(userState, fromNumber);
            break;

        default:
            if (validateInput(currentState.key, text)) {
                userState.data[currentState.key] = text.trim();
                userState.state++;
                await handleNextState(userState, fromNumber);
            } else {
                await sendTextMessage(BUSINESS_PHONE_NUMBER_ID, fromNumber, `Invalid input. ${currentState.prompt}`);
            }
            break;
    }
};

export const sendTextMessage = async (businessPhoneNumberId, to, body) => {
    await sendWhatsAppMessage(businessPhoneNumberId, to, {
        type: "text",
        text: { body },
    });
};

export const sendWhatsAppMessage = async (businessPhoneNumberId, to, messagePayload) => {
    const payload = {
        messaging_product: "whatsapp",
        to,
        ...messagePayload,
    };

    try {
        const response = await axios.post(
            `https://graph.facebook.com/v17.0/${businessPhoneNumberId}/messages`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${GRAPH_API_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("Message sent successfully:", response.data);
    } catch (error) {
        console.error("Error sending message:", error.response?.data || error.message);
    }
};

export const sendInteractiveMessage = async (businessPhoneNumberId, to) => {
    const payload = {
        type: "interactive",
        interactive: {
            type: "list",
            body: {
                text: "Welcome! What would you like to do?",
            },
            action: {
                button: "Options",
                sections: [
                    {
                        title: "Main Menu",
                        rows: [
                            { id: "menu_book", title: "Book Services", description: "Make a new booking" },
                            { id: "menu_cancel", title: "Cancel Booking", description: "Cancel an existing booking" },
                        ],
                    },
                ],
            },
        },
    };

    await sendWhatsAppMessage(businessPhoneNumberId, to, payload);
};

export const sendEventTypeList = async (businessPhoneNumberId, to) => {
    const sections = [
        {
            title: "Event Types",
            rows: eventTypes.map((eventType) => ({
                id: eventType.id,
                title: eventType.title,
            })),
        },
    ];

    const payload = {
        type: "interactive",
        interactive: {
            type: "list",
            body: {
                text: "Please select the type of event:",
            },
            action: {
                button: "Event Types",
                sections,
            },
        },
    };

    await sendWhatsAppMessage(businessPhoneNumberId, to, payload);
};

export const sendRegionList = async (businessPhoneNumberId, to, page = 0) => {
    const regionsPerPage = 9; // We'll use the 10th slot for "More"
    const startIndex = page * regionsPerPage;
    const endIndex = startIndex + regionsPerPage;
    const regionsPage = regions.slice(startIndex, endIndex);

    // Map regions to rows
    const rows = regionsPage.map((region) => ({
        id: region.id,
        title: region.title,
    }));

    // Check if there are more regions
    const hasMore = endIndex < regions.length;

    // Add "More" option if there are more regions
    if (hasMore) {
        rows.push({
            id: `more_${page + 1}`,
            title: "More",
        });
    }

    const sections = [
        {
            title: `Regions (${startIndex + 1}-${Math.min(endIndex, regions.length)})`,
            rows,
        },
    ];

    const payload = {
        type: "interactive",
        interactive: {
            type: "list",
            body: { text: "Please select the region for the event:" },
            action: { button: "Regions", sections },
        },
    };

    await sendWhatsAppMessage(businessPhoneNumberId, to, payload);
};



export const sendServicesTiles = async (businessPhoneNumberId, to) => {
    const sections = [
        {
            title: "Available Services",
            rows: services.map((service) => ({
                id: service.id,
                title: service.title,
                description: service.description,
            })),
        },
    ];

    const payload = {
        type: "interactive",
        interactive: {
            type: "list",
            body: { text: "Please select the services you need:" },
            action: { button: "Services", sections },
        },
    };

    await sendWhatsAppMessage(businessPhoneNumberId, to, payload);
};
