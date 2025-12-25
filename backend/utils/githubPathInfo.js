export async function githubPathInfo(path) {
  const url = `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "User-Agent": "CCPD-TV"
    }
  });

  if (res.status === 404) {
    return { exists: false };
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  const data = await res.json();

  // Folder → array
  if (Array.isArray(data)) {
    return {
      exists: true,
      type: "folder"
    };
  }

  // File → object
  return {
    exists: true,
    type: "file",
    sha: data.sha
  };
}
