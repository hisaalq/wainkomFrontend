import { Text, View } from "react-native";
// app/index.tsx
import LogoutButton from "@/components/LogoutButton";



export default function Index() {
  return (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
  <Text>User Home</Text>
  <LogoutButton />
</View>)
}
