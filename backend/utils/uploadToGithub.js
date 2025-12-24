import fs from "fs";

export async function uploadImageToGithub(filePath, remotePath) {
  const content = fs.readFileSync(filePath, { encoding: "base64" });

  const url = `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${remotePath}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "CCPD-TV"
    },
    body: JSON.stringify({
      message: `Add ${remotePath}`,
      content
    })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("GitHub upload error:", err);
    throw new Error("GitHub upload failed");
  }

  return `https://raw.githubusercontent.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/main/${remotePath}`;
}
