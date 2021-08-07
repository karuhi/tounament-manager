let admin = require("firebase-admin");
let serviceAccount = require("./key/app-supercollider-firebase-adminsdk-b0xve-492a59cf54.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin.firestore();
