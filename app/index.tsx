//import { Redirect } from 'expo-router';

import OrgnaizerHomeScreen from "@/components/orgnaizer/OrgnaizerHomeScreen";

//const MODE: 'auth' | 'app' = 'auth';       // change to 'app' to test tabs
//const ROLE: 'user' | 'organizer' = 'user'; // used only when MODE === 'app'

export default function Index() {
  //if (MODE === 'auth') return <Redirect href="/(auth)/signup" />; // or "/(auth)/signup"
  //return ROLE === 'organizer' ? <Redirect href="/(organizer)" /> : <Redirect href="/(tabs)" />;
  return <OrgnaizerHomeScreen />
}