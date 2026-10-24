import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

const SORTABLE_COLUMNS = {
  created_at: 'created_at',
  price: 'price',
  name: 'name',
};

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    price: Number(row.price),
    category: row.category,
    createdAt: row.created_at,
  };
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateProduct(body) {
  const errors = [];
  const source = body && typeof body === 'object' ? body : {};

  const name = typeof source.name === 'string' ? source.name.trim() : '';
  if (!name) {
    errors.push('Поле name обязательно');
  }

  const description = typeof source.description === 'string' ? source.description.trim() : '';
  if (!description) {
    errors.push('Поле description обязательно');
  }

  const imageUrl = typeof source.imageUrl === 'string' ? source.imageUrl.trim() : '';
  if (!imageUrl) {
    errors.push('Поле imageUrl обязательно');
  }

  const price = typeof source.price === 'number' ? source.price : Number.parseFloat(source.price);
  if (!Number.isFinite(price) || price < 0) {
    errors.push('Поле price должно быть числом больше или равным 0');
  }

  let category = typeof source.category === 'string' ? source.category.trim() : '';
  if (!category) {
    category = 'прочее';
  }
  category = category.slice(0, 64);

  return {
    errors,
    value: {
      name,
      description,
      imageUrl,
      price: Number.isFinite(price) ? price.toFixed(2) : null,
      category,
    },
  };
}

router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT category FROM products ORDER BY category ASC'
    );

    res.json(result.rows.map((row) => row.category));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Не удалось получить категории' });
  }
});

router.get('/', async (req, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const sort = typeof req.query.sort === 'string' ? req.query.sort : 'created_at';
    const order = typeof req.query.order === 'string' ? req.query.order : 'desc';
    const minPrice = Number.parseFloat(req.query.minPrice);
    const maxPrice = Number.parseFloat(req.query.maxPrice);

    const where = [];
    const params = [];

    const addParam = (value) => {
      params.push(value);
      return `$${params.length}`;
    };

    if (search) {
      const escaped = search.replace(/[\\%_]/g, '\\$&');
      const param = addParam(`%${escaped}%`);
      where.push(`(name ILIKE ${param} ESCAPE '\\' OR description ILIKE ${param} ESCAPE '\\')`);
    }

    if (category && category.toLowerCase() !== 'all') {
      const param = addParam(category);
      where.push(`lower(category) = lower(${param})`);
    }

    if (Number.isFinite(minPrice)) {
      const param = addParam(minPrice);
      where.push(`price >= ${param}`);
    }

    if (Number.isFinite(maxPrice)) {
      const param = addParam(maxPrice);
      where.push(`price <= ${param}`);
    }

    const sortColumn = SORTABLE_COLUMNS[sort] || 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const sql = `
      SELECT *
      FROM products
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${sortColumn} ${sortOrder}, id DESC
    `;

    const result = await pool.query(sql, params);

    res.json(result.rows.map(mapProduct));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Не удалось получить список товаров' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'Некорректный id товара' });
    }

    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    res.json(mapProduct(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Не удалось получить товар' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { errors, value } = validateProduct(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        error: {
          message: 'Проверьте данные товара',
          fields: errors,
        },
      });
    }

    const result = await pool.query(
      `
        INSERT INTO products (name, description, image_url, price, category)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [value.name, value.description, value.imageUrl, value.price, value.category]
    );

    res.status(201).json(mapProduct(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Не удалось добавить товар' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'Некорректный id товара' });
    }

    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    res.json({ deletedId: id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Не удалось удалить товар' });
  }
});

export default router;