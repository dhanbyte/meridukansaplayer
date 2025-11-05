import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAq8Zk7tueHQaIZ_kgApbje6EhJ4dAX4m8",
  authDomain: "manishprajapati-a10cd.firebaseapp.com",
  projectId: "manishprajapati-a10cd",
  storageBucket: "manishprajapati-a10cd.appspot.com",
  messagingSenderId: "817023797484",
  appId: "1:817023797484:web:cc07447197b3a8b1ad7dc9",
  measurementId: "G-J2B9T4LZPG"
};


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export { app as firebaseApp };
