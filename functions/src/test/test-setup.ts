import admin from 'firebase-admin';
import functionsTest from 'firebase-functions-test';

// Initialize the test SDK
const test = functionsTest();

// Initialize the Admin SDK if it hasn't been already
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Export the initialized SDKs for use in tests
export { test, admin };
