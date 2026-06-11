import React, { Suspense } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, Tv2, Globe, Heart } from 'lucide-react-native';
import { RootTabParamList, CharactersStackParamList, FavouritesStackParamList } from './types';
import { COLORS } from '../utils/colors';
import { ds, fs } from '../utils/responsive';

const CharacterListScreen = React.lazy(
  () => import('../features/characters/screens/CharacterListScreen'),
);
const CharacterDetailScreen = React.lazy(
  () => import('../features/characters/screens/CharacterDetailScreen'),
);
const EpisodesScreen = React.lazy(
  () => import('../features/episodes/screens/EpisodesScreen'),
);
const LocationsScreen = React.lazy(
  () => import('../features/locations/screens/LocationsScreen'),
);
const FavouritesScreen = React.lazy(
  () => import('../features/favourites/screens/FavouritesScreen'),
);

const SuspenseFallback: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator color={COLORS.primary} size="large" />
  </View>
);

const withSuspense = (Component: React.LazyExoticComponent<React.FC>): React.FC => {
  const Wrapped: React.FC = () => (
    <Suspense fallback={<SuspenseFallback />}>
      <Component />
    </Suspense>
  );
  return Wrapped;
};

const CharactersStack = createNativeStackNavigator<CharactersStackParamList>();
const FavouritesStack = createNativeStackNavigator<FavouritesStackParamList>();

const stackScreenOptions = {
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.text,
  headerTitleStyle: { fontSize: fs(16), fontWeight: '700' as const, color: COLORS.text },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: COLORS.background },
};

const CharactersNavigator: React.FC = () => (
  <CharactersStack.Navigator screenOptions={stackScreenOptions}>
    <CharactersStack.Screen
      name="CharacterList"
      component={withSuspense(CharacterListScreen)}
      options={{ headerShown: false }}
    />
    <CharactersStack.Screen
      name="CharacterDetail"
      component={withSuspense(CharacterDetailScreen)}
      options={({ route }) => ({ title: route.params.name, headerBackTitle: '' })}
    />
  </CharactersStack.Navigator>
);

const FavouritesNavigator: React.FC = () => (
  <FavouritesStack.Navigator screenOptions={stackScreenOptions}>
    <FavouritesStack.Screen
      name="FavouritesList"
      component={withSuspense(FavouritesScreen)}
      options={{ headerShown: false }}
    />
    <FavouritesStack.Screen
      name="CharacterDetail"
      component={withSuspense(CharacterDetailScreen)}
      options={({ route }) => ({ title: route.params.name, headerBackTitle: '' })}
    />
  </FavouritesStack.Navigator>
);

type TabIconProps = { focused: boolean; color: string };

const TAB_ICONS: Record<
  keyof RootTabParamList,
  (props: TabIconProps) => React.ReactElement
> = {
  Characters: ({ focused, color }) => (
    <Users size={ds(22)} color={color} strokeWidth={focused ? 2.2 : 1.8} />
  ),
  Episodes: ({ color }) => (
    <Tv2 size={ds(22)} color={color} strokeWidth={1.8} />
  ),
  Locations: ({ color }) => (
    <Globe size={ds(22)} color={color} strokeWidth={1.8} />
  ),
  Favourites: ({ focused, color }) => (
    <Heart
      size={ds(22)}
      color={color}
      strokeWidth={focused ? 0 : 1.8}
      fill={focused ? color : 'none'}
    />
  ),
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, ds(10)) + ds(6);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.tabActive,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => <View style={styles.tabBarBackground} />,
        tabBarStyle: {
          backgroundColor: COLORS.tabBar,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingTop: ds(8),
          paddingBottom: bottomPadding,
          height: ds(56) + bottomPadding,
          elevation: Platform.OS === 'android' ? 12 : 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
        },
        tabBarIcon: ({ focused, color }) =>
          TAB_ICONS[route.name as keyof RootTabParamList]({ focused, color }),
      })}
    >
      <Tab.Screen name="Characters" component={CharactersNavigator} />
      <Tab.Screen name="Episodes" component={withSuspense(EpisodesScreen)} />
      <Tab.Screen name="Locations" component={withSuspense(LocationsScreen)} />
      <Tab.Screen name="Favourites" component={FavouritesNavigator} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  tabBarBackground: {
    flex: 1,
    backgroundColor: COLORS.tabBar,
  },
  tabLabel: {
    fontSize: fs(10),
    fontWeight: '600',
    marginTop: ds(2),
  },
});

export default TabNavigator;
