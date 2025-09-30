import LogoutButton from '@/components/LogoutButton';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
export default function OrganizerHome() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Organizer Home</Text>
      <LogoutButton />
    </View>
  );
}