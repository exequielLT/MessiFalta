import React from 'react';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { ThemedText } from './themed-text';
import { Colors, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs style={styles.webContainer}>
      <TabSlot style={styles.contentSlot} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton iconName="home-outline" activeIconName="home">Inicio</TabButton>
          </TabTrigger>
          <TabTrigger name="figuritas" href="/figuritas" asChild>
            <TabButton iconName="grid-outline" activeIconName="grid">Figuritas</TabButton>
          </TabTrigger>
          <TabTrigger name="matches" href="/matches" asChild>
            <TabButton iconName="repeat-outline" activeIconName="repeat">Matches</TabButton>
          </TabTrigger>
          <TabTrigger name="kioscos" href="/kioscos" asChild>
            <TabButton iconName="map-outline" activeIconName="map">Kioscos</TabButton>
          </TabTrigger>
          <TabTrigger name="perfil" href="/perfil" asChild>
            <TabButton iconName="person-outline" activeIconName="person">Perfil</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

interface TabButtonProps extends TabTriggerSlotProps {
  iconName: keyof typeof Ionicons.glyphMap;
  activeIconName: keyof typeof Ionicons.glyphMap;
}

export function TabButton({ children, isFocused, iconName, activeIconName, ...props }: TabButtonProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  
  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <Ionicons 
        name={isFocused ? activeIconName : iconName} 
        size={22} 
        color={isFocused ? theme.primary : theme.onSurfaceVariant} 
      />
      <ThemedText 
        style={[
          styles.tabLabel, 
          { color: isFocused ? theme.primary : theme.onSurfaceVariant }
        ]} 
        type="labelSm"
      >
        {children}
      </ThemedText>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  return (
    <View 
      {...props} 
      style={[
        styles.tabBarContainer, 
        { 
          backgroundColor: theme.surfaceContainerLowest, 
          borderTopColor: theme.outlineVariant + '44' 
        }
      ]}
    >
      <View style={styles.tabBarInner}>
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  contentSlot: {
    flex: 1,
    height: '100%',
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  tabBarInner: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 500, // aligned with the main page content width
    height: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.one,
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
export { TabButtonProps };
