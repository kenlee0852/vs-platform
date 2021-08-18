import firebase from 'firebase/app';
import "firebase/analytics";
import "firebase/firestore";
import "firebase/storage";

let firebaseConfig = null;
try {
    firebaseConfig = require('./firebase.json');
} catch (error) {
    // load from process env
    firebaseConfig = {
        apiKey: process.env.API_KEY,
        authDomain: process.env.AUTH_DOMAIN,
        databaseURL: process.env.DATABASE_URL,
        projectId: process.env.PROJECT_ID,
        storageBucket: process.env.STORAGE_BUCKET,
        messagingSenderId: process.env.MESSAGING_SENDER_ID,
        appId: process.env.APP_ID,
        measurementId: process.env.MEASUREMENT_ID
    }
}

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();
}
const db = firebase.firestore();
const storage = firebase.storage();
export { db, storage }