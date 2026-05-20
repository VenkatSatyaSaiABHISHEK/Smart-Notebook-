import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  addDoc,
  serverTimestamp,
  deleteDoc,
  arrayUnion
} from 'firebase/firestore';

// --- COMMUNITY CORE ---

export const createCommunity = async (name, adminId, settings = {}) => {
  try {
    const communityRef = await addDoc(collection(db, 'communities'), {
      name,
      adminId,
      settings: {
        allowTextMessages: settings.allowTextMessages ?? true,
        allowFilesOnly: settings.allowFilesOnly ?? false,
        isPrivate: settings.isPrivate ?? true,
        ...settings
      },
      memberCount: 1,
      memberIds: [adminId], // Keep track of members for querying
      createdAt: serverTimestamp()
    });

    // Add admin as a member automatically
    await setDoc(doc(db, `communities/${communityRef.id}/members`, adminId), {
      userId: adminId,
      role: 'admin',
      joinedAt: serverTimestamp()
    });

    return communityRef.id;
  } catch (error) {
    console.error("Error creating community:", error);
    throw error;
  }
};

export const updateCommunitySettings = async (communityId, settings) => {
  try {
    const communityRef = doc(db, 'communities', communityId);
    await updateDoc(communityRef, { settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
};

export const getTopCommunities = async () => {
  try {
    // In a real app, you might order by memberCount or activity
    const q = query(collection(db, 'communities'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching communities:", error);
    return [];
  }
};

export const getCommunityDetails = async (communityId) => {
  try {
    const docRef = doc(db, 'communities', communityId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching community details:", error);
    throw error;
  }
};

// --- MEMBERSHIP & REQUESTS ---

export const sendJoinRequest = async (communityId, userId, userName = 'Unknown') => {
  try {
    const requestRef = doc(db, `communities/${communityId}/join_requests`, userId);
    await setDoc(requestRef, {
      userId,
      userName,
      status: 'pending',
      requestedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error sending join request:", error);
    throw error;
  }
};

export const handleJoinRequest = async (communityId, userId, action) => {
  // action: 'approve' | 'reject'
  try {
    const requestRef = doc(db, `communities/${communityId}/join_requests`, userId);
    
    if (action === 'approve') {
      // Add as member
      await setDoc(doc(db, `communities/${communityId}/members`, userId), {
        userId,
        role: 'member',
        joinedAt: serverTimestamp()
      });
      // Update member count and memberIds (requires transaction for safety in prod, but simple update here)
      const commRef = doc(db, 'communities', communityId);
      const commSnap = await getDoc(commRef);
      if (commSnap.exists()) {
        await updateDoc(commRef, { 
          memberCount: (commSnap.data().memberCount || 0) + 1,
          memberIds: arrayUnion(userId)
        });
      }
    }
    
    // Delete the request or mark as rejected
    await deleteDoc(requestRef);
  } catch (error) {
    console.error("Error handling join request:", error);
    throw error;
  }
};

export const getPendingRequests = async (communityId) => {
  try {
    const q = query(collection(db, `communities/${communityId}/join_requests`), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching requests:", error);
    return [];
  }
};

export const getUserCommunities = async (userId) => {
  try {
    const q = query(
      collection(db, 'communities'),
      where('memberIds', 'array-contains', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      isAdmin: doc.data().adminId === userId
    }));
  } catch (error) {
    console.error("Error fetching user communities:", error);
    return [];
  }
};

// --- CONTENT & SHARED NOTEBOOK ---

export const shareContent = async (communityId, userId, contentData) => {
  // contentData: { type: 'note' | 'file', title, url, content, allowOthersToViewNotebook }
  try {
    await addDoc(collection(db, `communities/${communityId}/content`), {
      ...contentData,
      authorId: userId,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error sharing content:", error);
    throw error;
  }
};

export const getCommunityContent = async (communityId) => {
  try {
    const q = query(collection(db, `communities/${communityId}/content`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching content:", error);
    return [];
  }
};

export const addCurriculumDay = async (communityId, dayData) => {
  try {
    await addDoc(collection(db, `communities/${communityId}/curriculum`), {
      ...dayData,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding curriculum:", error);
    throw error;
  }
};

export const getCurriculum = async (communityId) => {
  try {
    const q = query(collection(db, `communities/${communityId}/curriculum`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching curriculum:", error);
    return [];
  }
};

export const submitDayNote = async (communityId, curriculumId, userId, userName, content) => {
  try {
    // Use userId as document ID so each user has one notebook per day, preventing editing others.
    const noteRef = doc(db, `communities/${communityId}/curriculum/${curriculumId}/notes`, userId);
    await setDoc(noteRef, {
      userId,
      userName,
      content,
      submittedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error submitting day note:", error);
    throw error;
  }
};

export const getDayNotes = async (communityId, curriculumId) => {
  try {
    const q = query(collection(db, `communities/${communityId}/curriculum/${curriculumId}/notes`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching day notes:", error);
    return [];
  }
};

export const getAutomaticDayNotes = async (communityId, dayString) => {
  try {
    // 1. Get all members
    const membersSnap = await getDocs(collection(db, `communities/${communityId}/members`));
    const members = membersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let allCommunityNotes = [];

    // 2. Loop through each member and fetch their personal notebook for this day
    for (const member of members) {
      const entriesSnap = await getDocs(collection(db, `users/${member.id}/notebook_days/${dayString}/entries`));
      
      if (!entriesSnap.empty) {
        const memberEntries = entriesSnap.docs.map(doc => doc.data());
        allCommunityNotes.push({
          id: member.id + '_' + dayString,
          userName: member.userName || member.role || 'Community Member',
          entries: memberEntries, // Array of their raw notebook blocks
          userId: member.id
        });
      }
    }

    return allCommunityNotes;
  } catch (error) {
    console.error("Error auto-fetching community notebooks:", error);
    return [];
  }
};
