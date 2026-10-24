import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { deleteProduct, getCategories, getProducts } from '../api.js';

const initialFilters = {
  search: '',
  category: 'all',
  sort: 'created_at_desc',
  minPrice: '',
  maxPrice: '',
};

function getSortParams(sortValue) {
  const index = sortValue.lastIndexOf('_');

  return {
    sort: sortValue.slice(0, index),
    order: sortValue.slice(index + 1),
  };
}

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let ignore = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const { sort, order } = getSortParams(filters.sort);

        const data = await getProducts({
          search: filters.search,
          category: filters.category,
          sort,
          order,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
        });

        if (!ignore) {
          setProducts(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [filters]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить товар из каталога?')) {
      return;
    }

    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Каталог компьютерной техники</h1>
          <p className="muted">Товары загружаются из PostgreSQL через Express API.</p>
        </div>

        <Link className="button primary" to="/products/new">
          Добавить товар
        </Link>
      </div>

      <section className="panel toolbar">
        <div className="field grow">
          <label htmlFor="search">Поиск</label>
          <input
            id="search"
            name="search"
            type="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Название или описание"
          />
        </div>

        <div className="field">
          <label htmlFor="category">Категория</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleChange}
          >
            <option value="all">Все категории</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="sort">Сортировка</label>
          <select id="sort" name="sort" value={filters.sort} onChange={handleChange}>
            <option value="created_at_desc">Сначала новые</option>
            <option value="created_at_asc">Сначала старые</option>
            <option value="price_asc">Цена: по возрастанию</option>
            <option value="price_desc">Цена: по убыванию</option>
            <option value="name_asc">Название: А → Я</option>
            <option value="name_desc">Название: Я → А</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="minPrice">Цена от</label>
          <input
            id="minPrice"
            name="minPrice"
            type="number"
            min="0"
            step="0.01"
            value={filters.minPrice}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label htmlFor="maxPrice">Цена до</label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min="0"
            step="0.01"
            value={filters.maxPrice}
            onChange={handleChange}
          />
        </div>

        <div className="toolbar-actions">
          <button
            className="button secondary"
            type="button"
            onClick={() => setFilters(initialFilters)}
          >
            Сбросить
          </button>
        </div>
      </section>

      {error && <div className="error">{error}</div>}

      <div className="results-info muted">
        {loading ? 'Загрузка товаров...' : `Найдено товаров: ${products.length}`}
      </div>

      {!loading && products.length === 0 && !error && (
        <div className="panel empty">
          Товары не найдены. Измените фильтры или добавьте новый товар.
        </div>
      )}

      <div className="grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onDelete={handleDelete} />
        ))}
      </div>
    </>
  );
}