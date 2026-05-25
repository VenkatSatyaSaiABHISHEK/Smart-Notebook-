import { db } from '../config/firebase';
import { collection, addDoc, query, getDocs, serverTimestamp, doc, deleteDoc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

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
    const promises = daysArray.map(async (day) => {
      const q = query(collection(db, `users/${userId}/notebook_days/${day}/entries`));
      const snapshot = await getDocs(q);
      return !snapshot.empty ? day : null;
    });
    const results = await Promise.all(promises);
    return results.filter(d => d !== null);
  } catch (error) {
    console.error("Error fetching completed days:", error);
    return [];
  }
};

// Task Management APIs
export const getTasks = async (userId) => {
  try {
    const q = query(collection(db, `users/${userId}/tasks`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

export const addTask = async (userId, taskData) => {
  try {
    const docRef = await addDoc(collection(db, `users/${userId}/tasks`), {
      ...taskData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding task:", error);
    throw error;
  }
};

export const updateTask = async (userId, taskId, updateData) => {
  try {
    const docRef = doc(db, `users/${userId}/tasks`, taskId);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const deleteTask = async (userId, taskId) => {
  try {
    const docRef = doc(db, `users/${userId}/tasks`, taskId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

// Hash utility to generate simple unique document keys for code content
const hashCode = (str) => {
  if (!str) return "empty_code";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return "hash_" + Math.abs(hash);
};

// Local cache key helper
const getLocalCacheKey = (userId, codeContent) => {
  const docId = hashCode(codeContent.trim());
  return `explain_cache_${userId}_${docId}`;
};

// Synchronous local cache check/retrieve
export const getLocalCachedExplanation = (userId, codeContent) => {
  if (!userId || !codeContent) return null;
  try {
    const key = getLocalCacheKey(userId, codeContent);
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      return parsed.explanation;
    }
  } catch (e) {
    console.error("Error reading local cache:", e);
  }
  return null;
};

// Firestore cache lookup for code explanation (Storebase) with Local Storage fallback
export const getCachedExplanation = async (userId, codeContent) => {
  try {
    // 1. Try Local Storage first for instant response
    const localCached = getLocalCachedExplanation(userId, codeContent);
    if (localCached) {
      return localCached;
    }

    // 2. Fallback to Firestore (Storebase)
    const docId = hashCode(codeContent.trim());
    const docRef = doc(db, `users/${userId}/explanation_cache`, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const explanation = snap.data().explanation;
      // Save to local storage for future instant replays
      try {
        const key = getLocalCacheKey(userId, codeContent);
        localStorage.setItem(key, JSON.stringify({ explanation, updatedAt: new Date() }));
      } catch (e) {
        console.error("Error writing to local cache:", e);
      }
      return explanation;
    }
    return null;
  } catch (error) {
    console.error("Error fetching cached explanation:", error);
    return null;
  }
};

// Firestore cache write for code explanation (Storebase) and Local Storage
export const setCachedExplanation = async (userId, codeContent, explanation) => {
  try {
    const docId = hashCode(codeContent.trim());
    
    // 1. Save to Local Storage synchronously
    try {
      const key = getLocalCacheKey(userId, codeContent);
      localStorage.setItem(key, JSON.stringify({ explanation, updatedAt: new Date() }));
    } catch (e) {
      console.error("Error writing to local cache:", e);
    }

    // 2. Save to Firestore (Storebase)
    const docRef = doc(db, `users/${userId}/explanation_cache`, docId);
    await setDoc(docRef, {
      code: codeContent,
      explanation: explanation,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error caching explanation:", error);
  }
};

// Update user token consumption and savings in Firestore
export const updateUserTokens = async (userId, tokensUsed, tokensSaved = 0) => {
  try {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      const currentUsed = data.tokensUsed || 0;
      const currentSaved = data.tokensSaved || 0;
      
      await updateDoc(userRef, {
        tokensUsed: currentUsed + tokensUsed,
        tokensSaved: currentSaved + tokensSaved
      });
    } else {
      await setDoc(userRef, {
        uid: userId,
        tokensUsed: tokensUsed,
        tokensSaved: tokensSaved
      }, { merge: true });
    }
  } catch (error) {
    console.error("Error updating user tokens in Firestore:", error);
  }
};

// Dynamic topic detector from code and explanation content
export const detectTopic = (entryOrContent, language, aiExample) => {
  let content = '';
  let lang = '';
  let aiExp = '';
  let savedTopic = null;

  if (entryOrContent && typeof entryOrContent === 'object') {
    content = entryOrContent.content || '';
    lang = entryOrContent.language || '';
    aiExp = entryOrContent.aiExample || '';
    savedTopic = entryOrContent.topic || null;
  } else {
    content = entryOrContent || '';
    lang = language || '';
    aiExp = aiExample || '';
  }

  if (savedTopic) return savedTopic;

  // 1. Try to extract from AI explanation if it starts with "Topic: ..." or has "Topic: [Name]"
  if (aiExp) {
    const topicMatch = aiExp.match(/(?:^|\n)(?:#\s*)?Topic:\s*([^\n]+)/i);
    if (topicMatch) {
      return topicMatch[1].trim();
    }
  }

  // 2. Fallback to keywords in content
  const code = content.toLowerCase();
  
  if (code.includes('def gcd') || code.includes('gcd(') || code.includes('lcm(') || code.includes('prime') || code.includes('factorial') || code.includes('modulo')) {
    return 'Mathematics';
  }
  
  // Recursion check: if a function name calls itself
  const defMatch = code.match(/def\s+([a-zA-Z_]\w*)\s*\(/);
  if (defMatch) {
    const funcName = defMatch[1];
    const selfCallRegex = new RegExp(`\\b${funcName}\\s*\\(`, 'g');
    const matches = code.match(selfCallRegex);
    if (matches && matches.length > 1) {
      return 'Recursion';
    }
  }

  if (code.includes('sort(') || code.includes('sorted(') || code.includes('bubblesort') || code.includes('quicksort') || code.includes('mergesort')) {
    return 'Sorting';
  }
  if (code.includes('binary_search') || code.includes('search(') || code.includes('linear_search')) {
    return 'Search Algorithms';
  }
  if (code.includes('dp =') || code.includes('memo =') || code.includes('fibonacci') || code.includes('knapsack')) {
    return 'Dynamic Programming';
  }
  if (code.includes('tree') || code.includes('node') || code.includes('bst') || code.includes('binarytree')) {
    return 'Trees & Graphs';
  }
  if (code.includes('stack') || code.includes('queue') || code.includes('linkedlist') || code.includes('linked_list')) {
    return 'Data Structures';
  }
  if (code.includes('for ') || code.includes('while ')) {
    return 'Loops & Iteration';
  }
  if (code.includes('import ') || code.includes('print(')) {
    return 'Basic Programming';
  }
  
  // Fallback for markdown notes
  if (code.includes('recursion') || code.includes('recursive')) return 'Recursion';
  if (code.includes('sort') || code.includes('array')) return 'Algorithms';
  if (code.includes('math') || code.includes('equation')) return 'Mathematics';

  return 'General';
};



