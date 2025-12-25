export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("adminUser"));
  } catch {
    return null;
  }
};

export const getRole = () => getUser()?.role;