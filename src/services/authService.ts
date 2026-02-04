import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    User
} from 'firebase/auth';
import { auth } from './firebaseConfig';

// Mock User interface to match Firebase User
const createMockUser = (email: string): User => ({
    uid: 'mock-user-id-' + Math.random().toString(36).substr(2, 9),
    email: email,
    emailVerified: true,
    isAnonymous: false,
    metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString(),
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: async () => { },
    getIdToken: async () => 'mock-id-token',
    getIdTokenResult: async () => ({
        authTime: new Date().toISOString(),
        expirationTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        signInProvider: 'password',
        signInSecondFactor: null,
        token: 'mock-token',
        claims: {}
    }),
    reload: async () => { },
    toJSON: () => ({}),
    displayName: 'Mock User',
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase',
});

// Check if Firebase is actually configured
// Accessing the options from the app instance associated with auth
// @ts-ignore
const appOptions = auth.app?.options || {};
const apiKey = appOptions.apiKey;
const isFirebaseConfigured = apiKey && apiKey !== "YOUR_API_KEY";

// Mock state
let currentMockUser: User | null = null;
let observers: ((user: User | null) => void)[] = [];

const notifyObservers = () => {
    observers.forEach(observer => observer(currentMockUser));
};

export const AuthService = {
    login: async (email: string, password: string) => {
        if (isFirebaseConfigured) {
            return signInWithEmailAndPassword(auth, email, password);
        } else {
            // Mock Login
            console.log('Using Mock Login');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network
            if (email && password) {
                currentMockUser = createMockUser(email);
                notifyObservers();
                return { user: currentMockUser };
            }
            throw new Error('Invalid credentials (mock)');
        }
    },

    register: async (email: string, password: string) => {
        if (isFirebaseConfigured) {
            return createUserWithEmailAndPassword(auth, email, password);
        } else {
            // Mock Register
            console.log('Using Mock Register');
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (email && password) {
                currentMockUser = createMockUser(email);
                notifyObservers();
                return { user: currentMockUser };
            }
            throw new Error('Invalid data (mock)');
        }
    },

    logout: async () => {
        if (isFirebaseConfigured) {
            return firebaseSignOut(auth);
        } else {
            // Mock Logout
            console.log('Using Mock Logout');
            currentMockUser = null;
            notifyObservers();
        }
    },

    observeAuthState: (callback: (user: User | null) => void) => {
        if (isFirebaseConfigured) {
            return firebaseOnAuthStateChanged(auth, callback);
        } else {
            // Mock Observation
            observers.push(callback);
            callback(currentMockUser);
            return () => {
                observers = observers.filter(obs => obs !== callback);
            };
        }
    }
};
