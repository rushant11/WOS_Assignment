import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import TabNavigator from './TabNavigator';
import { COLORS } from '../utils/colors';

const RickMortyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: COLORS.background,
    card: COLORS.tabBar,
    text: COLORS.text,
    border: COLORS.border,
    primary: COLORS.primary,
    notification: COLORS.primary,
  },
};

const AppNavigator: React.FC = () => (
  <NavigationContainer theme={RickMortyTheme}>
    <TabNavigator />
  </NavigationContainer>
);

export default AppNavigator;
