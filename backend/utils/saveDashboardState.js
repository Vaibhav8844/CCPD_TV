import fs from "fs-extra";
import path from "path";
import { uploadToGoogleDrive } from "./uploadToGoogleDrive.js";
import { createGoogleDriveFolder } from "./createGoogleDriveFolder.js";
import { getDriveClient } from "./googleDriveOAuth.js";

const STATE_FILE_PATH = "./dashboard-state.json";
const DRIVE_FOLDER_NAME = "CCPD_Dashboard_Backup";
const DRIVE_STATE_FILENAME = "dashboard-state.json";

/**
 * Download a file from Google Drive
 */
async function downloadFromDrive(fileId, destinationPath) {
  const drive = await getDriveClient();
  
  const response = await drive.files.get(
    { fileId: fileId, alt: 'media' },
    { responseType: 'stream' }
  );
  
  const dest = fs.createWriteStream(destinationPath);
  
  return new Promise((resolve, reject) => {
    response.data
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .pipe(dest);
  });
}

/**
 * Find the dashboard state file in Google Drive
 */
async function findDriveStateFile() {
  try {
    const drive = await getDriveClient();
    const folderId = await createGoogleDriveFolder(DRIVE_FOLDER_NAME);
    
    const response = await drive.files.list({
      q: `name='${DRIVE_STATE_FILENAME}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, modifiedTime)',
      orderBy: 'modifiedTime desc',
      pageSize: 1
    });
    
    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0];
    }
    
    return null;
  } catch (error) {
    console.error("Error finding Drive state file:", error.message);
    return null;
  }
}

/**
 * Save dashboard state both locally and to Google Drive
 */
export async function saveDashboardState(dashboardState) {
  try {
    // Save locally first
    await fs.writeJson(STATE_FILE_PATH, dashboardState, { spaces: 2 });
    console.log("✓ Dashboard state saved locally");

    // Save to Google Drive
    try {
      // Ensure folder exists
      const folderId = await createGoogleDriveFolder(DRIVE_FOLDER_NAME);
      
      // Upload JSON file
      const result = await uploadToGoogleDrive(
        STATE_FILE_PATH,
        DRIVE_STATE_FILENAME,
        folderId
      );
      
      console.log("✓ Dashboard state backed up to Google Drive");
      return { success: true, driveFileId: result.id };
    } catch (driveError) {
      console.error("Google Drive backup failed (local save succeeded):", driveError.message);
      return { success: true, driveBackup: false };
    }
  } catch (error) {
    console.error("Failed to save dashboard state:", error);
    throw error;
  }
}

/**
 * Load dashboard state - prioritizes Google Drive, falls back to local
 */
export async function loadDashboardState() {
  try {
    // First, try to load from Google Drive
    console.log("Checking Google Drive for dashboard state...");
    const driveFile = await findDriveStateFile();
    
    if (driveFile) {
      try {
        // Download from Drive to a temporary location
        const tempPath = "./dashboard-state-temp.json";
        await downloadFromDrive(driveFile.id, tempPath);
        
        // Read the downloaded file
        const driveState = await fs.readJson(tempPath);
        
        // Save it as the local state (sync Drive to local)
        await fs.writeJson(STATE_FILE_PATH, driveState, { spaces: 2 });
        
        // Clean up temp file
        await fs.remove(tempPath);
        
        console.log("✓ Dashboard state loaded from Google Drive");
        return driveState;
      } catch (driveError) {
        console.error("Failed to load from Drive, trying local:", driveError.message);
      }
    } else {
      console.log("No dashboard state found on Google Drive");
    }

    // Fallback to local file
    if (await fs.pathExists(STATE_FILE_PATH)) {
      const localState = await fs.readJson(STATE_FILE_PATH);
      console.log("✓ Dashboard state loaded from local file");
      
      // Sync local to Drive
      try {
        const folderId = await createGoogleDriveFolder(DRIVE_FOLDER_NAME);
        await uploadToGoogleDrive(STATE_FILE_PATH, DRIVE_STATE_FILENAME, folderId);
        console.log("✓ Local state synced to Google Drive");
      } catch (syncError) {
        console.error("Failed to sync local state to Drive:", syncError.message);
      }
      
      return localState;
    }

    console.log("No dashboard state found locally or on Drive");
    return null;
  } catch (error) {
    console.error("Failed to load dashboard state:", error);
    return null;
  }
}
