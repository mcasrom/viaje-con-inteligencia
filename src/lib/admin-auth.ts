export function getAdminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

export function isAdminConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

export function verifyAdminPassword(provided: string | null): boolean {
  if (!provided) return false;
  const adminPassword = getAdminPassword();
  if (!adminPassword) return false;
  return adminPassword === provided;
}
