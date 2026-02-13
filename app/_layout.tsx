import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { theme } from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="question/[id]"
        options={{
          title: 'Question',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="module/[moduleId]"
        options={{
          title: 'Module',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="add-question"
        options={{
          title: 'Add Question',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="mock-interview"
        options={{
          title: 'Mock Interview',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="case-studies"
        options={{
          title: 'Case Studies',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="create-module"
        options={{
          title: 'New Module',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <DataProvider>
            <RootLayoutNav />
          </DataProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
