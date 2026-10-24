import { Link } from 'react-router-dom';
import { formatPrice } from '../format.js';

export default function ProductCard({ product, onDelete }) {
  return (
    <article className="card">
      <Link to={`/products/${product.id}`} className="card-image-link">
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
      </Link>

      <div className="card-body">
        <div className="card-top">
          <h3>
            <Link to={`/products/${product.id}`}>{product.name}</Link>
          </h3>
          <span className="badge">{product.category}</span>
        </div>

        <p className="description">{product.description}</p>

        <div className="card-footer">
          <strong className="price">{formatPrice(product.price)}</strong>

          <div className="actions">
            <Link className="button secondary small" to={`/products/${product.id}`}>
              Подробнее
            </Link>

            <button
              className="button danger small"
              type="button"
              onClick={() => onDelete(product.id)}
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}