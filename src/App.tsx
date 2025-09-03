import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';
import { LoginPage } from '@/pages/login';
import { Dashboard } from '@/pages/dashboard';
import { ApplicationsListPage } from '@/features/agent/pages/applications-list';
import { ApplicationNewPage } from '@/features/agent/pages/application-new';
import { ApplicationEditPage } from '@/features/agent/pages/application-edit';
import { ReviewQueuePage } from '@/features/approver/pages/review-queue';
import { ApplicationReviewPage } from '@/features/approver/pages/application-review';
import { MonitorOverviewPage } from '@/features/monitor/pages/overview';
import { MonitorApplicationsListPage } from '@/features/monitor/pages/applications-list';
import { MonitorApplicationViewPage } from '@/features/monitor/pages/application-view';
import { MonitorQRViewPage } from '@/features/monitor/pages/qr-view';
import Login from '@/pages/loginPage';
import ProfilePage from '@/pages/profilePage';
import Registration from './features/monitor/pages/registration';


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/loginPage" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="merchant-app-theme">
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <Routes>
              <Route path="/loginPage" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="applications" element={<ApplicationsListPage />} />
                <Route path="applications/new" element={<ApplicationNewPage />} />
                <Route path="applications/:id/edit" element={<ApplicationEditPage />} />
                <Route path="review" element={<ReviewQueuePage />} />
                <Route path="applications/:id/review" element={<ApplicationReviewPage />} />
                <Route path="monitor/overview" element={<MonitorOverviewPage />} />
                <Route path="monitor/applications" element={<MonitorApplicationsListPage />} />
                <Route path="monitor/applications/:id/view" element={<MonitorApplicationViewPage />} />
                <Route path="monitor/applications/:id/qr" element={<MonitorQRViewPage />} />
                <Route path="pages/profilePage" element={<ProfilePage/>}/>
                <Route path="registration" element={<Registration/>}/>
              </Route>
            </Routes>
          </div>
          <Toaster richColors position="top-right" />
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;