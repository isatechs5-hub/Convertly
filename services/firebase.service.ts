import {
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    User
} from 'firebase/auth';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    updateDoc,
    setDoc
} from 'firebase/firestore';
import { ref, set, push, onValue, off, get } from 'firebase/database';
import { auth, db, realtimeDb } from './firebase.config';

// Authentication Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google", error);
        throw error;
    }
};

export const loginWithGithub = async () => {
    try {
        const result = await signInWithPopup(auth, githubProvider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Github", error);
        throw error;
    }
};

export const registerWithEmail = async (email: string, pass: string, firstName: string, lastName: string) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        // Update Profile with Name
        await updateProfile(result.user, {
            displayName: `${firstName} ${lastName}`
        });
        return result.user;
    } catch (error) {
        console.error("Error registering user", error);
        throw error;
    }
}

export const loginWithEmail = async (email: string, pass: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        return result.user;
    } catch (error) {
        console.error("Error logging in", error);
        throw error;
    }
}

export const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
};

export const subscribeToAuthArray = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// Firestore Operations
export const addUserDocument = async (user: User) => {
    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'User',
                photoURL: user.photoURL || '',
                lastLogin: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };

            // Sync to Firestore
            await setDoc(userRef, userData);

            // Sync to Realtime DB
            try {
                await set(ref(realtimeDb, 'users/' + user.uid), userData);
            } catch (e) { console.warn("RTDB User Sync skipped (Permission/Network)"); }
        } else {
            // Just update last login
            const update = { lastLogin: new Date().toISOString() };
            await updateDoc(userRef, update);
            try {
                await set(ref(realtimeDb, 'users/' + user.uid + '/lastLogin'), update.lastLogin);
            } catch (e) { /* Ignore RTDB error */ }
        }
    } catch (error) {
        // Silently fail if Firestore is also locked, so app doesn't crash
        console.warn("User document sync skipped:", error);
    }
};

// Realtime Database Example with LocalStorage Fallback
export const saveConversionHistory = async (userId: string, conversionData: any) => {
    const dataToSave = {
        ...conversionData,
        timestamp: new Date().toISOString(),
        id: Date.now().toString() // Generate simple ID for local
    };

    try {
        const historyRef = ref(realtimeDb, `history/${userId}`);
        const newHistoryRef = push(historyRef);
        await set(newHistoryRef, dataToSave);
    } catch (error: any) {
        // Silently handle permission errors or network issues by falling back to LocalStorage
        if (error.code === 'PERMISSION_DENIED' || error.message?.includes('permission_denied')) {
            console.warn("Firebase permission denied. Saving history locally.");
        } else {
            console.warn("Error saving to cloud history, using local storage:", error);
        }
        
        // Fallback: Save to LocalStorage
        try {
            const key = `convertly_history_${userId}`;
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            const updated = [dataToSave, ...existing].slice(0, 50); // Keep last 50
            localStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {
            console.error("Local storage save failed", e);
        }
    }
};

export const getConversionHistory = async (userId: string) => {
    let cloudHistory: any[] = [];
    try {
        const historyRef = ref(realtimeDb, `history/${userId}`);
        const snapshot = await get(historyRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            cloudHistory = Object.values(data).reverse(); // Latest first
        }
    } catch (error) {
        console.warn("Could not fetch cloud history, falling back to local.");
    }

    // Merge with LocalStorage
    try {
        const key = `convertly_history_${userId}`;
        const localHistory = JSON.parse(localStorage.getItem(key) || '[]');
        
        // Combine and deduplicate (simple check)
        // If cloud works, it might be empty if we just started using it. 
        // If cloud failed, we rely on local.
        if (cloudHistory.length === 0) return localHistory;
        
        return [...cloudHistory, ...localHistory].slice(0, 50); 
    } catch (e) {
        return cloudHistory;
    }
};

// Update User Profile
export const updateUserProfile = async (user: User, profileData: { displayName?: string; photoURL?: string }) => {
    try {
        // 1. Update Firebase Auth Profile (Best Effort)
        const authData: { displayName?: string, photoURL?: string } = {};
        if (profileData.displayName) authData.displayName = profileData.displayName;

        if (profileData.photoURL) {
            // Only update Auth photo if it's a URL or a short data string. 
            // Long base64 strings often fail in Auth profile updates.
            if (profileData.photoURL.length < 2000 && !profileData.photoURL.startsWith('data:')) {
                authData.photoURL = profileData.photoURL;
            }
        }

        try {
            await updateProfile(user, authData);
        } catch (e) {
            console.warn("Auth profile update partial failure:", e);
        }

        // 2. Update Firestore (Best Effort)
        try {
            const userRef = doc(db, 'users', user.uid);
            // Check if doc exists first to decide on set vs update, or just set with merge
            await setDoc(userRef, {
                ...profileData,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (e) {
            console.warn("Firestore profile sync failed (Permission/Network):", e);
        }

        // 3. Update Realtime DB (Best Effort)
        try {
            await set(ref(realtimeDb, 'users/' + user.uid), {
                ...profileData,
                updatedAt: new Date().toISOString()
            });
        } catch (e) {
             console.warn("RealtimeDB profile sync failed (Permission/Network):", e);
        }

    } catch (error) {
        console.error("Critical error in updateUserProfile wrapper:", error);
        // We do NOT throw here, to allow the UI to proceed with local updates
    }
};

// Export updateProfile for direct usage
export { updateProfile };
