export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'admin';
}

export function verifyAdminPassword(provided: string | null): boolean {
  if (!provided) return false;
  const adminPassword = getAdminPassword();
  return adminPassword === provided;
}
