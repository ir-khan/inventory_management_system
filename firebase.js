// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
    initializeAuth,
    getReactNativePersistence,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
} from 'firebase/auth';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDc_eSQTOuxENCd9Jzch1ChM8KRB8twxG0",
    authDomain: "staff-and-inventory-management.firebaseapp.com",
    projectId: "staff-and-inventory-management",
    storageBucket: "staff-and-inventory-management.appspot.com",
    messagingSenderId: "628824106952",
    appId: "1:628824106952:web:8fd276b3ef3e724f53c2fd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const database = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
});
const storage = getStorage(app);

export {
    auth,
    database,
    storage,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
};