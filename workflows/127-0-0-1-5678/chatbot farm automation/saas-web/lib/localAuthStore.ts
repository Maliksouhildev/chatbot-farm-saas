import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  company: string;
  phone: string;
  salt?: string;
  passwordHash?: string;
  provider: 'email' | 'google';
  hasManualPassword: boolean;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), '.local-data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureStoreExists() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {}
  }
  if (!fs.existsSync(USERS_FILE)) {
    try {
      // Seed default admin account
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPassword('AdminPassword2026!', salt);
      const defaultAdmin: LocalUser = {
        id: 'usr_local_admin_001',
        email: 'admin@chatbotfarm.dz',
        name: 'Admin Store',
        company: "Admin Store's Hub",
        phone: '+213555000000',
        salt,
        passwordHash: hash,
        provider: 'email',
        hasManualPassword: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(USERS_FILE, JSON.stringify([defaultAdmin], null, 2), 'utf8');
    } catch (e) {
      console.warn('[LocalAuthStore Init Error]:', e);
    }
  }
}

function readUsers(): LocalUser[] {
  ensureStoreExists();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeUsers(users: LocalUser[]): void {
  ensureStoreExists();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error('[LocalAuthStore Write Error]:', e);
  }
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export function getLocalUserByEmail(email: string): LocalUser | null {
  const normalized = (email || '').trim().toLowerCase();
  const users = readUsers();
  return users.find((u) => u.email.toLowerCase() === normalized) || null;
}

export function getLocalUserById(id: string): LocalUser | null {
  const users = readUsers();
  return users.find((u) => u.id === id) || null;
}

export function createLocalUser(params: {
  email: string;
  password?: string;
  fullName?: string;
  companyName?: string;
  phoneNumber?: string;
  provider?: 'email' | 'google';
  hasManualPassword?: boolean;
}): LocalUser {
  const users = readUsers();
  const normalized = params.email.trim().toLowerCase();
  
  const existing = users.find((u) => u.email.toLowerCase() === normalized);
  if (existing) {
    throw new Error('User already exists in local auth store');
  }

  let salt: string | undefined;
  let passwordHash: string | undefined;
  const hasManualPassword = Boolean(params.password || params.hasManualPassword);

  if (params.password) {
    salt = crypto.randomBytes(16).toString('hex');
    passwordHash = hashPassword(params.password, salt);
  }

  const name = (params.fullName || normalized.split('@')[0]).trim();
  const newUser: LocalUser = {
    id: `usr_local_${crypto.randomUUID()}`,
    email: normalized,
    name,
    company: params.companyName || `${name}'s Store`,
    phone: params.phoneNumber || '',
    salt,
    passwordHash,
    provider: params.provider || 'email',
    hasManualPassword,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);
  return newUser;
}

export function verifyLocalUserPassword(email: string, password: string): { valid: boolean; user?: LocalUser; isGoogleWithoutPassword?: boolean } {
  const user = getLocalUserByEmail(email);
  if (!user) {
    return { valid: false };
  }

  if (user.provider === 'google' && !user.hasManualPassword) {
    return { valid: false, user, isGoogleWithoutPassword: true };
  }

  if (!user.salt || !user.passwordHash) {
    return { valid: false, user };
  }

  const computed = hashPassword(password, user.salt);
  if (computed === user.passwordHash) {
    return { valid: true, user };
  }

  return { valid: false, user };
}

export function updateLocalUserPassword(emailOrId: string, newPassword: string): boolean {
  const users = readUsers();
  const normalized = emailOrId.trim().toLowerCase();
  const userIndex = users.findIndex((u) => u.email.toLowerCase() === normalized || u.id === emailOrId);
  
  if (userIndex === -1) return false;

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(newPassword, salt);

  users[userIndex].salt = salt;
  users[userIndex].passwordHash = passwordHash;
  users[userIndex].hasManualPassword = true;
  users[userIndex].updatedAt = new Date().toISOString();

  writeUsers(users);
  return true;
}

export function upsertLocalGoogleUser(params: {
  email: string;
  name?: string;
  company?: string;
  phone?: string;
}): LocalUser {
  const users = readUsers();
  const normalized = params.email.trim().toLowerCase();
  const index = users.findIndex((u) => u.email.toLowerCase() === normalized);

  if (index !== -1) {
    const existing = users[index];
    if (params.name && (!existing.name || existing.name === existing.email.split('@')[0])) {
      existing.name = params.name;
    }
    existing.updatedAt = new Date().toISOString();
    writeUsers(users);
    return existing;
  }

  const name = (params.name || normalized.split('@')[0]).trim();
  const newUser: LocalUser = {
    id: `usr_local_${crypto.randomUUID()}`,
    email: normalized,
    name,
    company: params.company || `${name}'s Store`,
    phone: params.phone || '',
    provider: 'google',
    hasManualPassword: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);
  return newUser;
}
