module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-reanimated|@react-navigation|react-native-screens|react-native-safe-area-context|react-native-gesture-handler|@op-engineering|@testing-library|immer|@reduxjs)/)',
  ],
  moduleNameMapper: {
    '^react-native-reanimated$': '<rootDir>/node_modules/react-native-reanimated/mock.js',
  },
};
