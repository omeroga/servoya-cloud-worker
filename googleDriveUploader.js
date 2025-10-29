// ☁️ Servoya Google Drive Uploader
import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ הגדרת התיקייה הראשית ב־Drive (אפשר לשנות בהמשך לפי פלטפורמות)
const MAIN_FOLDER_ID = "root"; // אם נרצה ליצור תיקיות ייעודיות, נחליף זאת בהמשך

// קריאת האישור (token.json)
const TOKEN_PATH = path.join(__dirname, "token.json");
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");

// יצירת לקוח Drive מאומת
function getDriveClient() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(token);

  return google.drive({ version: "v3", auth: oAuth2Client });
}

// העלאת וידאו ל־Drive
export async function uploadToDrive(filePath) {
  try {
    const drive = getDriveClient();
    const fileName = path.basename(filePath);

    const fileMetadata = {
      name: fileName,
      parents: [MAIN_FOLDER_ID],
    };
    const media = {
      mimeType: "video/mp4",
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id, webViewLink, webContentLink",
    });

    console.log(`✅ Uploaded to Drive: ${fileName}`);
    console.log("🔗 File link:", response.data.webViewLink);
    return response.data;
  } catch (err) {
    console.error("❌ Upload to Drive failed:", err.message);
  }
}
