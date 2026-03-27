import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./config";

// Collection reference
const bookingsCollectionRef = collection(db, "bookings");

// Save a new booking
export const saveBooking = async (bookingData) => {
  try {
    const docRef = await addDoc(bookingsCollectionRef, {
      ...bookingData,
      status: "pending", // initial status
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding document: ", error);
    return { success: false, error: error.message };
  }
};

// Fetch booked dates for calendar to disable
export const getBookedDates = async () => {
  try {
    // Only fetch active bookings that are not cancelled
    const q = query(bookingsCollectionRef, where("status", "==", "pending")); // You can adjust this to your business logic
    const snapshot = await getDocs(q);
    
    let bookedDates = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.startDate && data.duration) {
        bookedDates.push({
          startDate: new Date(data.startDate),
          duration: data.duration
        });
      }
    });
    
    return bookedDates;
  } catch (error) {
    console.error("Error getting documents: ", error);
    return [];
  }
};
