import { cookies, headers } from 'next/headers';
import { verifyToken } from './jwt';

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  status: string;
  avatarUrl?: string | null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const userSession = cookieStore.get('user_session');

  if (!userSession) {
    return null;
  }

  try {
    return JSON.parse(userSession.value);
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function requireMobileAuth(): Promise<SessionUser> {
  const headerList = await headers();
  const authHeader = headerList.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);

  if (!payload) {
    throw new Error('Unauthorized');
  }

  return payload as unknown as SessionUser;
}
