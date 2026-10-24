import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createProduct, getCategories } from '../api.js';

const emptyForm = {
  name: '',
  description: '',
  imageUrl: '',
  price: '',
  category: '',
};

export default function AddProductPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setErrors([]);

    try {
      const created = await createProduct({
        ...form,
        price: Number(form.price),
      });

      navigate(`/products/${created.id}`);
    } catch (err) {
      setErrors(err.fields || [err.message]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel form-panel">
      <Link className="muted" to="/">
        ← Назад в каталог
      </Link>

      <h1>Добавить товар</h1>
      <p className="muted">Данные сохраняются в PostgreSQL через POST /api/products.</p>

      {errors.length > 0 && (
        <div className="error">
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Название</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="imageUrl">Ссылка на изображение</label>
          <input
            id="imageUrl"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://..."
            required
          />
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="price">Цена, ₽</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="category">Категория</label>
            <input
              id="category"
              name="category"
              list="category-options"
              value={form.category}
              onChange={handleChange}
              placeholder="например, ноутбуки"
            />
            <datalist id="category-options">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="actions">
          <button className="button primary" type="submit" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить товар'}
          </button>

          <Link className="button secondary" to="/">
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}