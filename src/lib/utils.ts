import { type ClassValue, clsx } from "clsx"
import { destroyCookie } from "nookies";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Deletes the token cookie by setting its expiration date to a time in the past.
 * This effectively removes the token from the browser's cache.
 * @return {void}
 */
export function deleteCookie(): void {
  console.log('Attempting to delete token cookie');
  document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  // Also use nookies to ensure the cookie is removed in all contexts
  destroyCookie(null, 'token', { path: '/' });
  console.log('Token cookie should be deleted now');
}

export async function deleteTokenCookie() {
  try {
    await fetch('/api/auth/delete-cookie', { method: 'POST' });
    console.log('Token cookie deletion requested');
  } catch (error) {
    console.error('Failed to delete token cookie', error);
  }
}