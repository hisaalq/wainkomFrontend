import { deleteToken } from "@/api/storage";
import { COLORS } from "@/assets/style/color";
import AuthContext from "@/context/authcontext";
import { Ionicons } from "@expo/vector-icons";
import Fontisto from "@expo/vector-icons/build/Fontisto";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs, useRouter } from "expo-router";
import { useContext } from "react";
import { Pressable } from "react-native";

const TabsLayout = () => {
  const router = useRouter();
  const { setIsAuthenticated, setIsOrganizer } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await deleteToken();
    } finally {
      setIsAuthenticated(false);
      setIsOrganizer(false);
      router.replace("/");
    }
  };
  
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.backgroundd },
        headerTintColor: COLORS.primary,
        tabBarStyle: { backgroundColor: COLORS.backgroundd },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.quaternary,
        headerShadowVisible: false,
        // Inherit default back button from the root stack
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
          headerRight: () => (
            <Pressable
              onPress={handleLogout}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="log-out-outline" size={24} color={COLORS.primary} />
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="routes"
        options={{
          title: "Routes",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="map-marker"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Fontisto name="more-v-a" color={color} size={size} />
          ),
        }}
      />

      {/** Hidden route: edit profile (navigable but not a tab) */}
      <Tabs.Screen
        name="editProfile"
        options={{
          href: null,
          title: "Edit Profile",
          // Hide the bottom tabs when viewing the edit screen for consistency
          tabBarStyle: { display: 'none' },
          headerShown: true,
          // Inherit default back button from root
        }}
      />

      {/* myProfile route should also show a back chevron header like editProfile */}
      <Tabs.Screen
        name="../myProfile"
        options={{
          href: null,
          title: "Profile",
          headerShown: true,
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
