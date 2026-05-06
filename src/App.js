import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Collection from "./pages/Collection";
import ProductDetails from "./pages/ProductDetails";
import ThankYou from "./pages/ThankYou";

import Dashboard from "./admin/Dashboard";
import Products from "./admin/Products";
import AddProduct from "./admin/AddProduct";
import Orders from "./admin/Orders";
import Collections from "./admin/Collections";
import EditProduct from "./admin/EditProduct";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import AdminSettings from "./components/AdminSettings";
import Reclamation from "./components/Reclamations";
import AdminReclamations from "./pages/ReclamationsAdmin";
import Avis from "./pages/Avis";
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>

          <ScrollToTop />
          <Navbar />

          <Routes>

            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/collection/:name" element={<Collection />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/avis" element={<Avis />} />

            <Route path="/admin-login" element={<AdminLogin />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/reclamation" element={<Reclamation />} />
            <Route path="/admin/reclamations" element={<AdminReclamations />} />
            <Route
              path="/admin/add-product"
              element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/collections"
              element={
                <ProtectedRoute>
                  <Collections />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/edit/:id"
              element={
                <ProtectedRoute>
                  <EditProduct />
                </ProtectedRoute>
              }
            />

          </Routes>

          <Footer />

        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;