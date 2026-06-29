import { useEffect, useRef, useState } from 'react';
import type { UserProfile } from '../../types';
import { initializeLineProfile } from '../../lib/liffClient';

export function useLineAuth(enabled = true) {
  const initialized = useRef(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(enabled);
  const [lineError, setLineError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsLiffReady(true);
      setIsLoadingProfile(false);
      return;
    }
    if (initialized.current) return;
    initialized.current = true;
    setIsLiffReady(false);
    setIsLoadingProfile(true);

    (async () => {
      try {
        const profile = await initializeLineProfile();
        setUserProfile(profile);
      } catch (error) {
        const nextError = error instanceof Error ? error : new Error('Unable to initialize LINE.');
        setLineError(nextError);
        console.error('LIFF:', nextError);
      } finally {
        setIsLiffReady(true);
        setIsLoadingProfile(false);
      }
    })();
  }, [enabled]);

  return { userProfile, isLiffReady, isLoadingProfile, lineError };
}
