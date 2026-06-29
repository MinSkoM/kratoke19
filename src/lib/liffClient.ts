import liff from '@line/liff';
import type { UserProfile } from '../types';
import { env, getLiffId } from './env';

const DEV_PROFILE: UserProfile = {
  userId: 'Udev001',
  displayName: 'คุณสมชาย',
  pictureUrl: '',
};

export async function initializeLineProfile(): Promise<UserProfile> {
  if (env.isDev) {
    return DEV_PROFILE;
  }

  const liffId = getLiffId();
  if (!liffId) {
    throw new Error('Missing VITE_LIFF_ID environment variable.');
  }

  await liff.init({ liffId });

  if (!liff.isLoggedIn()) {
    liff.login();
    throw new Error('Redirecting to LINE login.');
  }

  const profile = await liff.getProfile();
  return {
    userId: profile.userId,
    displayName: profile.displayName,
    pictureUrl: profile.pictureUrl || '',
  };
}

export function isLineInClient(): boolean {
  return liff.isInClient();
}

export async function sendLineMessages(messages: Parameters<typeof liff.sendMessages>[0]): Promise<void> {
  await liff.sendMessages(messages);
}

export function closeLineWindow(): void {
  liff.closeWindow();
}
