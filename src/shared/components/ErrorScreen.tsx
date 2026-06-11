import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../utils/colors';
import { ds, fs } from '../../utils/responsive';

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  message = 'Something went wrong.\nPlease check your connection.',
  onRetry,
}) => {
  const isOffline =
    message.toLowerCase().includes('network') ||
    message.toLowerCase().includes('offline');

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{isOffline ? '📡' : '🌀'}</Text>
      <Text style={styles.title}>
        {isOffline ? 'No Connection' : 'Something Went Wrong with list'}
      </Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: ds(32),
  },
  icon: {
    fontSize: fs(64),
    marginBottom: ds(16),
  },
  title: {
    fontSize: fs(20),
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: ds(8),
  },
  message: {
    fontSize: fs(14),
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: fs(22),
    marginBottom: ds(24),
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: ds(32),
    paddingVertical: ds(12),
    borderRadius: ds(24),
  },
  retryText: {
    fontSize: fs(15),
    fontWeight: '700',
    color: COLORS.background,
  },
});
