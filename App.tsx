import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './src/store';
import { loadFavourites } from './src/features/favourites/store/favouritesSlice';
import { initDatabase } from './src/database/sqliteService';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/utils/colors';

const FALLBACK_METRICS = {
  insets: { top: 59, bottom: 34, left: 0, right: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
      networkMode: 'offlineFirst',
      refetchOnReconnect: true,
    },
  },
});

const AppInitialiser: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const init = async (): Promise<void> => {
      await initDatabase();
      store.dispatch(loadFavourites());
    };
    void init();
  }, []);

  return <>{children}</>;
};

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics ?? FALLBACK_METRICS}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.background }}>
            <AppInitialiser>
              <AppNavigator />
            </AppInitialiser>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

export default App;
