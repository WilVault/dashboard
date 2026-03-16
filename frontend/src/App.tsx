import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { LoaderProvider } from './context/LoaderContext';
import { PrivateRoute, PublicOnlyRoute } from './components/RouteGuards';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';

// Public screens
import AuthScreen from './screens/AuthScreen';

// Private screens
import Dashboard from './screens/Dashboard';

function App() {
  return (
    <SessionProvider>
      <LoaderProvider>
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toasterId="default"
          toastOptions={{
            className: '',
            duration: 5000,
            removeDelay: 1000,
            style: {
              background: '#252535',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: 'green',
                secondary: 'black',
              },
            },
          }}
        />
        <BrowserRouter>
          <Routes>

            {/* ── Landing / Marketing pages ─────────────────────────────
                No layout, no auth check.
                Visible to everyone regardless of login state.
                Add bare <Route> here — no PublicOnlyRoute or PrivateRoute.
                e.g. <Route path="/" element={<LandingPage />} />
                e.g. <Route path="/pricing" element={<Pricing />} />
            ────────────────────────────────────────────────────────── */}


            {/* ── Public auth pages ─────────────────────────────────────
                PublicOnlyRoute   — redirects to /dashboard if already logged in.
                PublicLayout      — shared centered dark background for all auth pages.
                To add a new auth page: add a <Route> child below.
                e.g. /register, /forgot-password
            ────────────────────────────────────────────────────────── */}
            <Route
              element={
                <PublicOnlyRoute>
                  <PublicLayout />
                </PublicOnlyRoute>
              }
            >
              <Route path="/login" element={<AuthScreen />} />
              {/* <Route path="/register" element={<RegisterScreen />} /> */}
              {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
            </Route>

            {/* ── Private pages ─────────────────────────────────────────
                PrivateRoute      — redirects to /login if not authenticated.
                DashboardLayout   — shared layout (sidebar, navbar, etc).
                To add a new private page: add a <Route> child below.
                e.g. /settings, /profile
            ────────────────────────────────────────────────────────── */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              {/* <Route path="settings" element={<Settings />} /> */}
              {/* <Route path="profile" element={<Profile />} /> */}
            </Route>

            {/* ── Catch-all ─────────────────────────────────────────────
                Any unknown route falls back to /dashboard.
            ────────────────────────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />

          </Routes>
        </BrowserRouter>
      </LoaderProvider>
    </SessionProvider>
  );
}

export default App;