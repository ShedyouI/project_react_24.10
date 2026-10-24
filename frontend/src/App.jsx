import { Link, Route, Routes } from 'react-router-dom';
import AddProductPage from './pages/AddProductPage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import ProductPage from './pages/ProductPage.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="container header-inner">
          <Link className="logo" to="/">
            TechCatalog
          </Link>

          <nav>
            <Link to="/">Каталог</Link>
            <Link to="/products/new">Добавить товар</Link>
          </nav>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/products/new" element={<AddProductPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="*" element={<div className="panel empty">Страница не найдена</div>} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container">
          Учебный проект: React + Vite, Express, PostgreSQL, Docker Compose
        </div>
      </footer>
    </div>
  );
}