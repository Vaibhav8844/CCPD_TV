import fs from "fs-extra";
import path from "path";
import { uploadToGoogleDrive } from "./uploadToGoogleDrive.js";
import { createGoogleDriveFolder } from "./createGoogleDriveFolder.js";

const STATE_FILE_PATH = "./dashboard-state.json";
const DRIVE_FOLDER_NAME = "CCPD_Dashboard_Backup";

/**
 * Save dashboard state both locally and to Google Drive
 */
export async function saveDashboardState(dashboardState) {
  try {
    // Save locally
    await fs.writeJson(STATE_FILE_PATH, dashboardState, { spaces: 2 });
    console.log("✓ Dashboard state saved locally");

    // Save to Google Drive
    try {
      // Ensure folder exists
      const folderId = await createGoogleDriveFolder(DRIVE_FOLDER_NAME);
      
      // Upload JSON file
      const result = await uploadToGoogleDrive(
        STATE_FILE_PATH,
        "dashboard-state.json",
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
 * Load dashboard state from local file or Google Drive
 */
export async function loadDashboardState() {
  try {
    // Try loading from local file first
    if (await fs.pathExists(STATE_FILE_PATH)) {
      const state = await fs.readJson(STATE_FILE_PATH);
      console.log("✓ Dashboard state loaded from local file");
      return state;
    }

    console.log("No local dashboard state found");
    return null;
  } catch (error) {
    console.error("Failed to load dashboard state:", error);
    return null;
  }
}
