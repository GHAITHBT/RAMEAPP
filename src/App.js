import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from './login';
import RequestForm from './RequestForm';
import DataPage from './DataPage/DataPage';
import ChartsPage from './ChartsPage';
import Navbar from './Navbar';
import Header from './Header';
import './App.css';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <div className={`App ${isLoginPage ? '' : 'main-content'}`}>
      {!isLoginPage && <Navbar />}
      {!isLoginPage && <Header />}
      {isLoginPage ? (
        <Routes>
          <Route path="/" element={<LoginPage />} />
        </Routes>
      ) : (
        <div className="Content">
          <Routes>
          <Route
              path="/chart"
              element={
                <ProtectedRoute>
                  <ChartsPage />
                </ProtectedRoute>
              }
            />
           
            <Route
              path="/data"
              element={
                <ProtectedRoute>
                  <DataPage />
                </ProtectedRoute>
              }
            />
           <Route
              path="/Add"
              element={
                <ProtectedRoute>
                  <RequestForm />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      )}
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  );
}

export default AppWrapper;
