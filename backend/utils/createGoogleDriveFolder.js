import { getDriveClient } from "./googleDriveOAuth.js";

export async function createGoogleDriveFolder(folderPath) {
  const driveClient = await getDriveClient();
  let currentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  try {
    const parts = folderPath.split('/');
    
    // Navigate through each folder in the path, creating if needed
    for (const folderName of parts) {
      if (!folderName) continue;
      
      // Check if folder already exists
      const folderSearchResponse = await driveClient.files.list({
        q: `name='${folderName}' and '${currentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id)',
      });

      if (folderSearchResponse.data.files && folderSearchResponse.data.files.length > 0) {
        // Folder exists, use it
        currentFolderId = folderSearchResponse.data.files[0].id;
      } else {
        // Create the folder
        const folderMetadata = {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [currentFolderId],
        };

        const folderResponse = await driveClient.files.create({
          requestBody: folderMetadata,
          fields: 'id',
        });

        currentFolderId = folderResponse.data.id;
      }
    }

    return currentFolderId;
  } catch (error) {
    console.error("Google Drive create folder error:", error);
    throw new Error("Failed to create Google Drive folder: " + error.message);
  }
}
