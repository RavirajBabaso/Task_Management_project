import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import AppRouter from './routes/AppRouter';
import { store } from './store';

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              border: '1px solid #EFF2F6',
              borderRadius: '14px',
              color: '#1E293B'
            }
          }}
        />
        <AppRouter />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
