import { Redirect } from 'expo-router';
const role: 'user' | 'organizer' = 'user'; // change type here for testing
export default function Index() {
  return role === 'organizer' ? <Redirect href="/(organizer)" /> : <Redirect href="/(tabs)" />;
}