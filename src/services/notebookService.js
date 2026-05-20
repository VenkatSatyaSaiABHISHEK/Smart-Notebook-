import { db } from '../config/firebase';
import { collection, addDoc, query, getDocs, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';

export const getNotebookEntries = async (userId, day) => {
  try {
    const q = query(collection(db, `users/${userId}/notebook_days/${day}/entries`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching notebook entries:", error);
    return [];
  }
};

export const addNotebookEntry = async (userId, day, entryData) => {
  try {
    const docRef = await addDoc(collection(db, `users/${userId}/notebook_days/${day}/entries`), {
      ...entryData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding notebook entry:", error);
    throw error;
  }
};

export const deleteNotebookEntry = async (userId, day, entryId) => {
  try {
    const docRef = doc(db, `users/${userId}/notebook_days/${day}/entries`, entryId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting notebook entry:", error);
    throw error;
  }
};

export const updateNotebookEntry = async (userId, day, entryId, updateData) => {
  try {
    const docRef = doc(db, `users/${userId}/notebook_days/${day}/entries`, entryId);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating notebook entry:", error);
    throw error;
  }
};

export const getCompletedNotebookDays = async (userId, daysArray) => {
  try {
    const completedDays = [];
    for (const day of daysArray) {
      const q = query(collection(db, `users/${userId}/notebook_days/${day}/entries`));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        completedDays.push(day);
      }
    }
    return completedDays;
  } catch (error) {
    console.error("Error fetching completed days:", error);
    return [];
  }
};
