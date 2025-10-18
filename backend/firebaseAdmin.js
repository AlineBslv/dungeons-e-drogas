const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

if (!admin.apps.length) {
  // Você precisará criar um Service Account no Firebase Console
  // e adicionar as credenciais no arquivo .env
  // Por enquanto, este arquivo está pronto para receber a configuração

  // Descomente quando tiver o Service Account:
  /*
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  */
}

const db = admin.firestore();
module.exports = db;
