import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCpmTp0Lom99fl3TyJxUYsja3JbAJUHWh0",
  authDomain: "pmonv2.firebaseapp.com",
  projectId: "pmonv2",
  storageBucket: "pmonv2.firebasestorage.app",
  messagingSenderId: "390684442473",
  appId: "1:390684442473:web:9eb2b9f4d8c7cdf36347f8"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Test Firebase connection
console.log('Firebase app initialized:', app.name);
console.log('Firestore database initialized:', db.app.name);