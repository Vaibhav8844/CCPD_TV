import { getDriveClient } from "./googleDriveOAuth.js";

export async function googleDrivePathInfo(path) {
  const driveClient = await getDriveClient();
  let currentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  try {
    const parts = path.split('/');
    
    // Navigate through each folder in the path
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      if (!name) continue;
      
      const response = await driveClient.files.list({
        q: `name='${name}' and '${currentFolderId}' in parents and trashed=false`,
        fields: 'files(id, mimeType)',
      });

      if (!response.data.files || response.data.files.length === 0) {
        return { exists: false };
      }

      const file = response.data.files[0];
      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
      
      // If this is the last part, return info
      if (i === parts.length - 1) {
        return {
          exists: true,
          type: isFolder ? 'folder' : 'file',
          id: file.id,
        };
      }
      
      // If not the last part, it must be a folder to continue
      if (!isFolder) {
        return { exists: false };
      }
      
      currentFolderId = file.id;
    }

    return { exists: false };
  } catch (error) {
    return { exists: false };
  }
}
