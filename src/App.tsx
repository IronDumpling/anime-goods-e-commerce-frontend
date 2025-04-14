import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
