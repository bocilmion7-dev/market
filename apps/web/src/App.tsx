import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen">
          <h1 className="text-2xl font-bold p-4">Marketplace</h1>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;