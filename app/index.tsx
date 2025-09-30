import { Redirect } from 'expo-router';

const MODE: 'auth' | 'app' = 'auth';       // change to 'app' to test tabs
const ROLE: 'user' | 'organizer' = 'user'; // used only when MODE === 'app'

// export default function Index() {
//   if (MODE === 'auth') return <Redirect href="/(auth)/signup" />; // or "/(auth)/signup"
//   return ROLE === 'organizer' ? <Redirect href="/(organizer)" /> : <Redirect href="/(tabs)" />;
// }import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EventsScreen from '../components/EventsHeader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EventsScreen />
    </QueryClientProvider>
  );
}
