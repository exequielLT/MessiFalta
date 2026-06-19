import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeContext } from '@/context/theme-context';
import { Spacing } from '@/constants/theme';

export interface AppHeaderProps {
  title?: string;
  showActions?: boolean;
  pendingNotificationsCount?: number;
}

export default function AppHeader({
  title = 'FiguMatch',
  showActions = true,
  pendingNotificationsCount = 0,
}: AppHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const { toggleTheme } = useThemeContext();

  const isMatchesScreen = pathname === '/matches' || pathname.includes('matches');
  const showBadge = pendingNotificationsCount > 0 && !isMatchesScreen;

  return (
    <View style={[styles.headerContainer, { borderColor: theme.outlineVariant + '33' }]}>
      <View style={styles.headerInner}>
        {/* Logo and Brand Title */}
        <View style={styles.logoContainer}>
          <Ionicons name="football" size={26} color={theme.primary} />
          <ThemedText type="headlineSm" style={styles.logoText}>
            {title}
          </ThemedText>
        </View>

        {/* Action Buttons */}
        {showActions && (
          <View style={styles.headerActions}>
            {/* Theme Toggle Button */}
            <Pressable 
              onPress={toggleTheme}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              accessibilityLabel="Alternar modo de color"
              accessibilityRole="button"
            >
              <Ionicons 
                name={colorScheme === 'dark' ? 'sunny' : 'moon-outline'} 
                size={22} 
                color={theme.onSurface} 
              />
            </Pressable>

            {/* Notifications Button */}
            <Pressable 
              onPress={() => router.push('/matches')}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              accessibilityLabel="Ver notificaciones de matches"
              accessibilityRole="button"
            >
              <Ionicons name="notifications-outline" size={24} color={theme.onSurface} />
              {showBadge && (
                <View style={[styles.badge, { backgroundColor: theme.error }]}>
                  <ThemedText style={styles.badgeText} type="labelSm">
                    {pendingNotificationsCount}
                  </ThemedText>
                </View>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  headerInner: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  logoText: {
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
