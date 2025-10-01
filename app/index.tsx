
import OrgnaizerHomeScreen from "@/components/orgnaizer/OrgnaizerHomeScreen";
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

// export default function Index() {
  
//   return <OrgnaizerHomeScreen />
// }
