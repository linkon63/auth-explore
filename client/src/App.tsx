import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import HomePage from '@/components/home/HomePage';
import { NoteList } from '@/components/notes/NoteList';
import NodeDetails from '@/components/notes/NodeDetails';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import type { JSX } from 'react';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <NoteList />
              </ProtectedRoute>
            }
          />
          <Route path="/notes/:id" element={
            <ProtectedRoute>
              <NodeDetails />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default App;
