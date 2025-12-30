import { loadUsersState, saveUsersState } from "../utils/saveUsersState.js";

// Default users to initialize with
const DEFAULT_USERS = [
  {
    "id": "1",
    "username": "Vaibhav",
    "passwordHash": "$2b$10$EXcy3vvN4CZ/eBxu4Ww/4.1pOgSkiemGmxhT5j/DwPnIn6U88mf.y",
    "role": "EDITOR"
  },
  {
    "id": "2",
    "username": "editor",
    "passwordHash": "$2b$10$TlNLVLhkNrNhoAY9R70VB.7nNbyac3cZcDKupDeL0rDT7THxdSR5O",
    "role": "EDITOR"
  },
  {
    "id": "3",
    "username": "viewer",
    "passwordHash": "$2b$10$C93y4lQOgmieazaAx1m1DuerrFGcNQ4RdcUiNe9NLRGNst548G/lO",
    "role": "VIEWER"
  }
];

// In-memory cache
let usersCache = null;

/**
 * Initialize users from Google Drive or use defaults
 */
export async function initializeUsers() {
  try {
    const users = await loadUsersState();
    if (users && Array.isArray(users)) {
      usersCache = users;
      console.log("✓ Users initialized from Google Drive");
    } else {
      usersCache = DEFAULT_USERS;
      // Save default users to Drive
      await saveUsersState(DEFAULT_USERS).catch(err => 
        console.error("Failed to save default users:", err.message)
      );
      console.log("✓ Default users initialized");
    }
  } catch (error) {
    console.error("Error initializing users:", error);
    usersCache = DEFAULT_USERS;
  }
}

export function getUsers() {
  return usersCache || DEFAULT_USERS;
}

export function findUser(username) {
  return getUsers().find(u => u.username === username);
}

/**
 * Add a new user and save to Drive
 */
export async function addUser(user) {
  const users = getUsers();
  users.push(user);
  usersCache = users;
  await saveUsersState(users);
  return user;
}

/**
 * Update existing user and save to Drive
 */
export async function updateUser(userId, updates) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) throw new Error("User not found");
  
  users[index] = { ...users[index], ...updates };
  usersCache = users;
  await saveUsersState(users);
  return users[index];
}

/**
 * Delete user and save to Drive
 */
export async function deleteUser(userId) {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== userId);
  usersCache = filtered;
  await saveUsersState(filtered);
}
