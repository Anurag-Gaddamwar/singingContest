// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1J_9Btu9jr05v0e8IOqAF-LNXlmqsAKE",
  authDomain: "singingcontest-ed67b.firebaseapp.com",
  projectId: "singingcontest-ed67b",
  storageBucket: "singingcontest-ed67b.firebasestorage.app",
  messagingSenderId: "168948727078",
  appId: "1:168948727078:android:20f43656e66716b1e9d5e7"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const FIREBASE_DB = getFirestore(FIREBASE_APP);

