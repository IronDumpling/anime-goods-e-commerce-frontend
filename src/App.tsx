import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import './App.css'

function App() {
  return (
    <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductList />} />
    </Route>
  </Routes>
  )
}

export default App
