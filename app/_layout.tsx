import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect } from 'react';
import { Colors } from '../src/constants/themes';
import { ToastProvider } from '../src/components/Toast';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      activateKeepAwakeAsync().catch(() => {});
    }
    return () => {
      if (Platform.OS !== 'web') {
        deactivateKeepAwake().catch(() => {});
      }
    };
  }, []);

  return (
    <ToastProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.dark.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="challenge" options={{ gestureEnabled: false }} />
          <Stack.Screen name="completion" options={{ gestureEnabled: false }} />
          <Stack.Screen name="history" />
        </Stack>
      </View>
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
});
