// Firestore reads and writes for the admin panel.
//
// bookings/{id}  ref, name, phone, area, start, end, days, extraController, sms,
//                total, paid, status, source, createdAt
// blocks/{id}    { start, end } dates the website shows as taken. A confirmed booking
//                owns the block with its own id; manual blocks have a `note`.
// expenses/{id}  { date, label, amount }
// settings/pricing  prices shown on the website
import { useEffect, useState } from 'react';
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { makeRef, rentalEnd } from '../lib/booking';
import { withDefaults } from '../config/pricing';

const bookingsQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
const blocksRef = collection(db, 'blocks');
const expensesRef = collection(db, 'expenses');
const expensesQuery = query(expensesRef, orderBy('date', 'desc'));
const pricingRef = doc(db, 'settings', 'pricing');

const toRows = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));
const toPricing = (snap) => withDefaults(snap.data());

function useLive(source, transform) {
  const [state, setState] = useState({ data: null, error: null });
  useEffect(() => onSnapshot(
    source,
    (snap) => setState({ data: transform(snap), error: null }),
    (error) => setState({ data: null, error }),
  ), [source, transform]);
  return state;
}

export const useBookings = () => useLive(bookingsQuery, toRows);
export const useBlocks = () => useLive(blocksRef, toRows);
export const useExpenses = () => useLive(expensesQuery, toRows);
export const usePricing = () => useLive(pricingRef, toPricing);

// pending → confirmed → delivered → returned, or cancelled at any point before delivery.
// Confirming takes the dates off the website; cancelling or returning frees them.
export async function setStatus(booking, status) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'bookings', booking.id), { status, [`${status}At`]: serverTimestamp() });
  const block = doc(db, 'blocks', booking.id);
  if (status === 'confirmed') batch.set(block, { start: booking.start, end: booking.end, bookingId: booking.id });
  if (status === 'cancelled' || status === 'returned') batch.delete(block);
  await batch.commit();
}

export const updateBooking = (id, fields) => updateDoc(doc(db, 'bookings', id), fields);

// Saves changes to a booking. If it's holding dates on the website, they move with it.
export async function editBooking(booking, changes) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'bookings', booking.id), changes);
  if (booking.status === 'confirmed' || booking.status === 'delivered') {
    batch.set(doc(db, 'blocks', booking.id), { start: changes.start, end: changes.end, bookingId: booking.id });
  }
  await batch.commit();
}

// Removes a booking for good, and frees its dates on the website if it was holding any.
export async function deleteBooking(booking) {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'bookings', booking.id));
  batch.delete(doc(db, 'blocks', booking.id));
  await batch.commit();
}

// A booking taken by phone or in person: saved as already confirmed.
export async function addBooking(fields) {
  const bookingDoc = doc(collection(db, 'bookings'));
  const end = rentalEnd(fields.start, fields.days);
  const batch = writeBatch(db);
  batch.set(bookingDoc, {
    ...fields, end, ref: makeRef(), sms: false, paid: false,
    status: 'confirmed', source: 'admin', createdAt: serverTimestamp(),
  });
  batch.set(doc(db, 'blocks', bookingDoc.id), { start: fields.start, end, bookingId: bookingDoc.id });
  await batch.commit();
}

export const addBlock = (start, end, note) => addDoc(blocksRef, { start, end, note });
export const removeBlock = (id) => deleteDoc(doc(db, 'blocks', id));

export const addExpense = (expense) => addDoc(expensesRef, { ...expense, createdAt: serverTimestamp() });
export const removeExpense = (id) => deleteDoc(doc(db, 'expenses', id));

export const savePricing = (pricing) => setDoc(pricingRef, pricing);
