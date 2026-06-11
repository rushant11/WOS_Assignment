import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { ChevronRight, Heart, MapPin } from 'lucide-react-native';
import { Character } from '../../../types/character';
import { COLORS } from '../../../utils/colors';
import { ds, fs } from '../../../utils/responsive';
import { FadeImage } from '../../../shared/components/ProgressiveImage';
import { StatusBadge } from './StatusBadge';

const AVATAR_SIZE = ds(72);

interface CharacterCardProps {
  character: Character;
  onPress: (character: Character) => void;
  isFavourite?: boolean;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onPress,
  isFavourite = false,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (): void => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 60,
      bounciness: 3,
    }).start();
  };

  const handlePressOut = (): void => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 60,
      bounciness: 3,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => onPress(character)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={styles.avatarWrap}>
          <FadeImage
            uri={character.image}
            style={styles.avatar}
            borderRadius={ds(10)}
            fallbackLabel={character.name}
          />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {character.name}
            </Text>
            {isFavourite && (
              <Heart
                size={ds(13)}
                color={COLORS.dead}
                fill={COLORS.dead}
                strokeWidth={0}
              />
            )}
          </View>

          <View style={styles.metaRow}>
            <StatusBadge status={character.status} />
            <View style={styles.metaDivider} />
            <Text style={styles.species} numberOfLines={1}>
              {character.species}
            </Text>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={ds(12)} color={COLORS.textMuted} strokeWidth={2} />
            <Text style={styles.locationName} numberOfLines={1}>
              {character.location.name}
            </Text>
          </View>
        </View>

        <ChevronRight
          size={ds(16)}
          color={COLORS.textMuted}
          strokeWidth={2}
          style={styles.chevron}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: ds(14),
    marginHorizontal: ds(16),
    marginVertical: ds(5),
    paddingVertical: ds(10),
    paddingLeft: ds(10),
    paddingRight: ds(12),
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: AVATAR_SIZE + ds(20),
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: ds(10),
    overflow: 'hidden',
    backgroundColor: COLORS.skeleton,
    flexShrink: 0,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  info: {
    flex: 1,
    marginLeft: ds(12),
    marginRight: ds(4),
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ds(6),
    gap: ds(6),
  },
  name: {
    flex: 1,
    fontSize: fs(15),
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.15,
    lineHeight: fs(20),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ds(6),
  },
  metaDivider: {
    width: 1,
    height: ds(12),
    backgroundColor: COLORS.borderLight,
    marginHorizontal: ds(8),
  },
  species: {
    flex: 1,
    fontSize: fs(12),
    color: COLORS.textSecondary,
    lineHeight: fs(16),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds(5),
  },
  locationName: {
    flex: 1,
    fontSize: fs(11),
    color: COLORS.textMuted,
    lineHeight: fs(15),
  },
  chevron: {
    flexShrink: 0,
    opacity: 0.6,
  },
});
