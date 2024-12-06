import { bookingsRef } from "../config/config.js";

export const getBookingsByPhone = async (customerPhone) => {
    const snapshot = await bookingsRef.orderByChild("customerPhone").equalTo(customerPhone).once("value");
    return snapshot.val();
};

export const saveBooking = async (bookingData) => {
    await bookingsRef.push(bookingData);
};
