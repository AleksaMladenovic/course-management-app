import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const serviceAccount = JSON.parse(fs.readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));

const __dirname = path.dirname(fileURLToPath(import.meta.url));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function deleteTestUsers() {
  let nextPageToken;
  let deleted = 0;
  do {
    const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
    for (const userRecord of listUsersResult.users) {
      const email = userRecord.email || '';
      if (/^test.*@test\.com$/.test(email)) {
        await admin.auth().deleteUser(userRecord.uid);
        console.log('Deleted:', email);
        deleted++;
      }
    }
    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);
  console.log(`Total deleted: ${deleted}`);
}

deleteTestUsers().catch(console.error);