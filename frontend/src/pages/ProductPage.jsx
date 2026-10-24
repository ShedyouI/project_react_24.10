import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteProduct, getProduct } from '../api.js';
import { formatDate, formatPrice } from '../format.js';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError('');

    getProduct(id)
      .then((data) => {
        if (!ignore) {
          setProduct(data);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Удалить этот товар?')) {
      return;
    }

    try {
      await deleteProduct(id);
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="panel">Загрузка товара...</div>;
  }

  if (error) {
    return (
      <div className="panel">
        <div className="error">{error}</div>
        <Link className="button secondary" to="/">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="panel detail">
      <div className="detail-image">
        <img src={product.imageUrl} alt={product.name} />
      </div>

      <div className="detail-info">
        <Link className="muted" to="/">
          ← Назад в каталог
        </Link>

        <h1>{product.name}</h1>

        <span className="badge">{product.category}</span>

        <p className="detail-description">{product.description}</p>

        <div className="detail-price">{formatPrice(product.price)}</div>

        <div className="muted">Добавлен: {formatDate(product.createdAt)}</div>

        <div className="actions">
          <button className="button danger" type="button" onClick={handleDelete}>
            Удалить товар
          </button>
        </div>
      </div>
    </div>
  );
}