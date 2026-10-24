const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.error?.message ||
      (typeof data?.error === 'string' ? data.error : 'Ошибка запроса к серверу');

    const error = new Error(message);

    if (data?.error?.fields) {
      error.fields = data.error.fields;
    }

    throw error;
  }

  return data;
}

export function getProducts(params = {}) {
  const cleanEntries = Object.entries(params).filter(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return false;
    }

    if (key === 'category' && value === 'all') {
      return false;
    }

    return true;
  });

  const query = new URLSearchParams(Object.fromEntries(cleanEntries)).toString();

  return request(`/products${query ? `?${query}` : ''}`);
}

export function getCategories() {
  return request('/products/categories');
}

export function getProduct(id) {
  return request(`/products/${id}`);
}

export function createProduct(payload) {
  return request('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(id) {
  return request(`/products/${id}`, {
    method: 'DELETE',
  });
}