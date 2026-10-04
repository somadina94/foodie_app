import { useEffect, useRef } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, type Theme } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { deleteToken, getToken } from '@/lib/secureToken';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getMe } from '@/services/authService';
import { setBootstrapped, setCredentials, logout } from '@/store/authSlice';
import { registerForPushNotificationsAsync } from '@/lib/pushNotifications';
import { persistor, store } from '@/store';
import { FoodieToast } from '@/components/providers/FoodieToast';
import { RootNavigator } from '@/navigation/RootNavigator';
import { theme } from '@/lib/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const navTheme: Theme = {
  dark: false,
  colors: {
    primary: theme.primary,
    background: theme.background,
    card: theme.card,
    text: '#0a0a0a',
    border: theme.border,
    notification: theme.primary,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
};

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    let alive = true;
    (async () => {
      try {
        const token = await getToken();
        if (!token) {
          if (alive) dispatch(setBootstrapped(true));
          return;
        }
        try {
          const r = await getMe(token);
          if (alive) dispatch(setCredentials({ user: r.data.user }));
        } catch {
          await deleteToken();
          if (alive) dispatch(logout());
        } finally {
          if (alive) dispatch(setBootstrapped(true));
        }
      } catch (e) {
        if (__DEV__) console.warn('[auth bootstrap] failed:', e);
        if (alive) dispatch(setBootstrapped(true));
      }
    })();
    return () => {
      alive = false;
    };
  }, [dispatch]);

  return <>{children}</>;
}

/**
 * Luxestate-style: register Expo push on auth and whenever the app returns to foreground.
 */
function PushRegistrationOnAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const bootstrapped = useAppSelector((s) => s.auth.bootstrapped);

  useEffect(() => {
    if (!bootstrapped || !isAuthenticated) return;

    registerForPushNotificationsAsync().catch((err) => {
      if (__DEV__) console.warn('[push] Registration failed:', err);
    });

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        registerForPushNotificationsAsync().catch(() => undefined);
      }
    });

    return () => sub.remove();
  }, [bootstrapped, isAuthenticated]);

  return <>{children}</>;
}

function InnerApp() {
  return (
    <AuthBootstrap>
      <PushRegistrationOnAuth>
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      </PushRegistrationOnAuth>
    </AuthBootstrap>
  );
}

export function AppProviders() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate
            loading={
              <View className="flex-1 items-center justify-center bg-neutral-50">
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            }
            persistor={persistor}
          >
            <QueryClientProvider client={queryClient}>
              <InnerApp />
              <FoodieToast />
            </QueryClientProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
