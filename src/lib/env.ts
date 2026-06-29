export const env = {
  liffId: import.meta.env.VITE_LIFF_ID as string | undefined,
  gasUrl: import.meta.env.VITE_GAS_URL as string | undefined,
  isDev: import.meta.env.DEV,
};

export function requireGasUrl(): string {
  if (!env.gasUrl) {
    throw new Error('Missing VITE_GAS_URL environment variable.');
  }
  return env.gasUrl;
}

export function getLiffId(): string | undefined {
  return env.liffId?.trim() || undefined;
}
