import firebase from 'firebase/app';
import "firebase/analytics";
import "firebase/firestore";
import "firebase/storage";

import firebaseConfig from './firebase.config';

// 確認firebase是否準備初始化
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();
}
const db = firebase.firestore();
const storage = firebase.storage();
export { db, storage }