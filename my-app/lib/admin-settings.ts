export interface AdminSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  guestAccess: boolean;
  maxFileSize: string;
  maxPostsPerDay: number;
  autoModeration: boolean;
  emailNotifications: boolean;
  analyticsEnabled: boolean;
  requireEmailVerification: boolean;
  requireTwoFactor: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  enableRateLimiting: boolean;
  enableAuditLog: boolean;
  enableBackup: boolean;
  backupFrequency: string;
  retentionPeriod: number;
  enableCompression: boolean;
  enableEncryption: boolean;
  maxConnections: number;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  enableEmailNotifications: boolean;
}

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  siteName: 'DOM Project',
  siteDescription: 'A platform for biblical discussion and community',
  maintenanceMode: false,
  registrationEnabled: true,
  guestAccess: true,
  maxFileSize: '10MB',
  maxPostsPerDay: 10,
  autoModeration: true,
  emailNotifications: true,
  analyticsEnabled: true,
  requireEmailVerification: true,
  requireTwoFactor: false,
  sessionTimeout: 24,
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  enableRateLimiting: true,
  enableAuditLog: true,
  enableBackup: true,
  backupFrequency: 'daily',
  retentionPeriod: 30,
  enableCompression: true,
  enableEncryption: true,
  maxConnections: 100,
  smtpHost: '',
  smtpPort: 587,
  smtpUsername: '',
  smtpPassword: '',
  fromEmail: 'noreply@domproject.com',
  fromName: 'DOM Project',
  enableEmailNotifications: true,
};

export function canReadAdminSettings(role?: string | null): boolean {
  return role === 'admin' || role === 'dev' || role === 'lead_teacher';
}

export function canManageAdminSettings(role?: string | null): boolean {
  return role === 'admin' || role === 'dev';
}

export function canBypassMaintenanceMode(role?: string | null): boolean {
  return canManageAdminSettings(role);
}

export function getClientSafeAdminSettings(settings?: Partial<AdminSettings> | null): AdminSettings {
  return {
    ...DEFAULT_ADMIN_SETTINGS,
    ...settings,
    smtpPassword: '',
  };
}
