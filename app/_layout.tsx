// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { Stack } from "expo-router";

// const queryClient = new QueryClient();

// export default function RootLayout() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <Stack screenOptions={{ headerShown: false }} />
//     </QueryClientProvider>
//   );
// }/
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size, focused }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "home";

            if (route.name === "home") iconName = "home";
            else if (route.name === "events") iconName = "calendar";
            else if (route.name === "settings") iconName = "settings";

            return (
              <View style={{ alignItems: "center" }}>
                <Ionicons
                  name={iconName}
                  size={focused ? size + 6 : size}
                  color={focused ? "#00d4ff" : color}
                />
                {focused && (
                  <Text style={{ color: "#00d4ff", fontSize: 12, marginTop: 2 }}>
                    {route.name === "home"
                      ? "Home"
                      : route.name === "events"
                      ? "Events"
                      : "Settings"}
                  </Text>
                )}
              </View>
            );
          },
          tabBarStyle: {
            backgroundColor: "#1e1e1e",
            borderTopWidth: 0,
            height: 70,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            overflow: "hidden",
          },
          tabBarActiveTintColor: "#00d4ff",
          tabBarInactiveTintColor: "#888",
          headerShown: false,
        })}
      >
        {/* 🔹 حدد الصفحات التي تظهر في التاب فقط */}
        <Tabs.Screen name="home" />
        <Tabs.Screen name="events" />
        <Tabs.Screen name="settings" />
      </Tabs>
    </QueryClientProvider>
  );
}
