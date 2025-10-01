import { COLORS } from '@/assets/style/color';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';

 export default function OrganizerTabs() {
   return (
     <Tabs
       screenOptions={{
         headerStyle: { backgroundColor: COLORS.backgroundd },
        headerTintColor: COLORS.primary,
        tabBarStyle: { backgroundColor: COLORS.backgroundd },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.quaternary,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dots-horizontal" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}