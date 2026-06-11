import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { CharacterFilters, CharacterGender, CharacterStatus } from '../../../types/character';
import { COLORS } from '../../../utils/colors';
import { ds, fs } from '../../../utils/responsive';

interface FilterModalProps {
  visible: boolean;
  currentFilters: CharacterFilters;
  onApply: (filters: CharacterFilters) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: Array<{ label: string; value: CharacterStatus | '' }> = [
  { label: 'All', value: '' },
  { label: 'Alive', value: 'Alive' },
  { label: 'Dead', value: 'Dead' },
  { label: 'Unknown', value: 'unknown' },
];

const GENDER_OPTIONS: Array<{ label: string; value: CharacterGender | '' }> = [
  { label: 'All', value: '' },
  { label: 'Female', value: 'Female' },
  { label: 'Male', value: 'Male' },
  { label: 'Genderless', value: 'Genderless' },
  { label: 'Unknown', value: 'unknown' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  currentFilters,
  onApply,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [localFilters, setLocalFilters] = useState<CharacterFilters>(currentFilters);

  useEffect(() => {
    if (visible) {
      setLocalFilters(currentFilters);
    }
  }, [visible, currentFilters]);

  const handleApply = (): void => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = (): void => {
    const cleared: CharacterFilters = { name: currentFilters.name, status: '', gender: '' };
    setLocalFilters(cleared);
    onApply(cleared);
    onClose();
  };

  const renderChips = <T extends string>(
    options: Array<{ label: string; value: T }>,
    selected: T,
    onSelect: (value: T) => void,
  ) => (
    <View style={styles.chipRow}>
      {options.map(opt => {
        const isActive = selected === opt.value;
        return (
          <TouchableOpacity
            key={opt.value || 'all'}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(opt.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View style={styles.handle} />
            <View style={styles.titleRow}>
              <Text style={styles.title}>Filters</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={ds(18)} color={COLORS.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Status</Text>
              {renderChips(STATUS_OPTIONS, localFilters.status ?? '', value =>
                setLocalFilters(f => ({ ...f, status: value })),
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Gender</Text>
              {renderChips(GENDER_OPTIONS, localFilters.gender ?? '', value =>
                setLocalFilters(f => ({ ...f, gender: value })),
              )}
            </View>
          </ScrollView>

          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, ds(12)) + ds(8) },
            ]}
          >
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: ds(20),
    borderTopRightRadius: ds(20),
    maxHeight: '75%',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: COLORS.border,
  },
  sheetHeader: {
    paddingTop: ds(10),
    paddingHorizontal: ds(20),
    paddingBottom: ds(4),
  },
  handle: {
    width: ds(36),
    height: ds(4),
    borderRadius: ds(2),
    backgroundColor: COLORS.borderLight,
    alignSelf: 'center',
    marginBottom: ds(14),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ds(4),
  },
  title: {
    fontSize: fs(18),
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: ds(32),
    height: ds(32),
    borderRadius: ds(16),
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scrollArea: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: ds(20),
    paddingTop: ds(12),
    paddingBottom: ds(8),
  },
  section: {
    marginBottom: ds(20),
  },
  sectionLabel: {
    fontSize: fs(11),
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: ds(12),
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds(8),
  },
  chip: {
    paddingHorizontal: ds(16),
    paddingVertical: ds(9),
    borderRadius: ds(20),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    minWidth: ds(72),
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: COLORS.primaryDim,
    borderColor: COLORS.primaryBorder,
  },
  chipText: {
    fontSize: fs(13),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: ds(10),
    paddingHorizontal: ds(20),
    paddingTop: ds(14),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: ds(14),
    borderRadius: ds(12),
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  resetText: {
    fontSize: fs(14),
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 2,
    paddingVertical: ds(14),
    borderRadius: ds(12),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    fontSize: fs(14),
    color: COLORS.background,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
