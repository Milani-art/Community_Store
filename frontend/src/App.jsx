import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import BulletinBoard from './pages/BulletinBoard';
import SellItem from './pages/SellItem';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <Router>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <main className="container" style={{ flex: 1 }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/bulletin" element={<BulletinBoard />} />
                    <Route path="/sell" element={<SellItem />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin" element={<AdminPanel />} />
                  </Routes>
                </main>
                <CartDrawer />
                <Footer />
              </div>
            </Router>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
  );
}

export default App;