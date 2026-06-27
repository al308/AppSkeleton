import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { Game } from '../constants/theme';

export default function RootLayout(): React.ReactElement {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: Game.bgSolid },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="worlds" />
        <Stack.Screen name="world/[id]" />
        <Stack.Screen name="game/[id]" options={{ animation: 'fade' }} />
        <Stack.Screen name="training/[lesson]" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="settings/index"
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
