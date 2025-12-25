import fs from "fs";
import path from "path";

const filePath = path.resolve("users/users.json");

export function getUsers() {
  return JSON.parse(fs.readFileSync(filePath));
}

export function findUser(username) {
  return getUsers().find(u => u.username === username);
}
