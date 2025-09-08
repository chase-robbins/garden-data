const admin = require('firebase-admin');
require('dotenv').config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'garden-data-dd423'
  });
}

const auth = admin.auth();
const db = admin.firestore();

module.exports = { admin, auth, db };