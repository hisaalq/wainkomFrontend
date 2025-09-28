import { COLORS } from '@/assets/style/color';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs } from "expo-router";


const queryClient = new QueryClient();

const TabsLayout = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <Tabs screenOptions={{
        headerStyle: { backgroundColor:COLORS.backgroundd },
        headerTintColor: COLORS.primary,
        tabBarStyle: { backgroundColor:COLORS.backgroundd },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.quaternary,
        headerShadowVisible: false,}}>

        <Tabs.Screen name="index" 
        options={{ title: "Home", 
        tabBarIcon: ({ color, size }) => 
        <MaterialCommunityIcons name="home" color={color} size={size} /> 
        }} />

        <Tabs.Screen name="events" 
        options={{ title: "Events", 
        tabBarIcon: ({ color, size }) => 
        <MaterialCommunityIcons name="calendar" color={color} size={size} />
        }} />

        <Tabs.Screen name="routes" 
        options={{ title: "Routes", 
        tabBarIcon: ({ color, size }) => 
        <MaterialCommunityIcons name="map-marker" color={color} size={size} /> 
        }} />

        <Tabs.Screen name="settings" 
        options={{ title: "Settings", 
        tabBarIcon: ({ color, size }) => 
        <MaterialCommunityIcons name="cog" color={color} size={size} /> 
        }} />
      </Tabs>
    </QueryClientProvider>
  );
};

export default TabsLayout;
