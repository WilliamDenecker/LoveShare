// lib/utils.ts

/**
 * Reads the custom authentication cookie to get the current user.
 */
export function getCurrentUser(): string {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(^| )loveshare_user=([^;]+)/);
    if (match) return match[2];
  }
  return "Unknown";
}

/**
 * Converts a Javascript Date or ISO string into our strict DD/MM/YYYY and HH:mm formats.
 */
export function formatDateTime(dateInput: string | Date) {
  const d = new Date(dateInput);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return {
    dateOnly: `${day}/${month}/${year}`,
    timeOnly: `${hours}:${minutes}`,
    full: `${day}/${month}/${year}, ${hours}:${minutes}`,
  };
}

/**
 * Converts an uploaded File object into a Base64 string for database storage.
 */
export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}