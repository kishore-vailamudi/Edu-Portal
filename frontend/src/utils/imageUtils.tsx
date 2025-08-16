// API base URL
const API_BASE_URL = "http://localhost:5000";

/**
 * Gets the correct image URL for display
 * @param photoURL The photo URL from the user object
 * @returns The complete URL for displaying the image
 */
export const getImageUrl = (photoURL: string | undefined): string => {
  console.log("getImageUrl input:", photoURL);

  if (!photoURL) {
    console.log("getImageUrl: empty photoURL");
    return "";
  }

  // If it's a data URL (base64), return it directly
  if (photoURL.startsWith("data:")) {
    console.log("getImageUrl: returning data URL");
    return photoURL;
  }

  // If it's already a full URL, return it directly
  if (photoURL.startsWith("http")) {
    console.log("getImageUrl: returning URL as is:", photoURL);
    return photoURL;
  }

  // Ensure there's a leading slash for the path
  const path = photoURL.startsWith("/") ? photoURL : `/${photoURL}`;
  const url = `${API_BASE_URL}${path}`;
  console.log("getImageUrl: returning direct URL:", url);
  return url;
};

/**
 * Checks if an image exists at the given URL
 * @param url The URL to check
 * @returns A promise that resolves to true if the image exists, false otherwise
 */
export const checkImageExists = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Gets a fallback for when an image doesn't exist
 * @param name The name to use for generating initials
 * @returns The initials of the name
 */
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export default {
  getImageUrl,
  checkImageExists,
  getInitials,
};
