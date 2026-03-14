// ============================================
// FIREBASE CONFIG
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyCCvnw5eBBjUAa0piQ7Njy2t_W4TVZSIwk",
    authDomain: "nexbook-14d69.firebaseapp.com",
    projectId: "nexbook-14d69",
    storageBucket: "nexbook-14d69.firebasestorage.app",
    messagingSenderId: "445301731220",
    appId: "1:445301731220:web:500608bc6903aa8a40e981",
    measurementId: "G-VYH8GSRLZD"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    console.log('🔥 Firebase conectado');
} catch (e) {
    console.warn('⚠️ Erro no Firebase:', e);
}