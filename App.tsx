import 'react-native-gesture-handler';

import { StatusBar } from 'expo-status-bar';

import './global.css';
import { AppProviders } from '@/providers/AppProviders';

if (__DEV__) {
  const g = globalThis as typeof globalThis & {
    ErrorUtils?: {
      getGlobalHandler: () => (e: Error, isFatal?: boolean) => void;
      setGlobalHandler: (h: (e: Error, isFatal?: boolean) => void) => void;
    };
  };
  const prev = g.ErrorUtils?.getGlobalHandler?.();
  g.ErrorUtils?.setGlobalHandler?.((error, isFatal) => {
    const cause = (error as Error & { cause?: unknown })?.cause;
    console.error('[AppError]', error?.message);
    if (cause) console.error('[AppError cause]', cause);
    if (error?.stack) console.error('[AppError stack]', error.stack);
    prev?.(error, isFatal);
  });
}

export default function App() {
  return (
    <>
      <AppProviders />
      <StatusBar style="dark" />
    </>
  );
}
