const ADMIN_KEY = "malaca-mail:admin-session";
const ADMIN_PASSWORD_KEY = "malaca-mail:admin-password";

const DEFAULT_ADMIN_PASSWORD = "admin2026";

export function getAdminPassword(): string {
  if (typeof window === "undefined") return DEFAULT_ADMIN_PASSWORD;
  return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
}

export function adminLogin(password: string): boolean {
  const correct = getAdminPassword();
  if (password !== correct) return false;
  localStorage.setItem(ADMIN_KEY, JSON.stringify({ loggedIn: true, at: new Date().toISOString() }));
  return true;
}

export function adminLogout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_KEY);
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return data?.loggedIn === true;
  } catch {
    return false;
  }
}

export function changeAdminPassword(oldPassword: string, newPassword: string): boolean {
  if (oldPassword !== getAdminPassword()) return false;
  if (!newPassword || newPassword.length < 6) return false;
  localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);
  return true;
}
