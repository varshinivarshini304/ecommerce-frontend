// Firebase Configuration
// ============================================
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a new Firebase project (or use existing one)
// 3. Go to Project Settings > Your apps > Web app
// 4. Copy your config object below
// 5. Replace the placeholder values with your actual Firebase credentials
// 6. Make sure Firebase Authentication is enabled in your project
// ============================================

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_AUTH_DOMAIN_HERE",
    projectId: "YOUR_PROJECT_ID_HERE",
    storageBucket: "YOUR_STORAGE_BUCKET_HERE",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
    appId: "YOUR_APP_ID_HERE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get authentication instance
const auth = firebase.auth();

// Export for use in other files
window.firebaseAuth = auth;
