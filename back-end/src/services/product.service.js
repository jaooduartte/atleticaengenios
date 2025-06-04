const db = require('../utils/db');

async function createProduct(productData) {
  const queryText = `
    INSERT INTO products (title, description, value, amount, relates_to, image, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *;
  `;
  const queryValues = [
    productData.title,
    productData.description,
    parseFloat(productData.value),
    Number.isNaN(parseInt(productData.amount, 10)) ? 0 : parseInt(productData.amount, 10),
    productData.relates_to,
    productData.image || null
  ];
  try {
    console.log(productData);
    const res = await db.query(queryText, queryValues);
    return res.rows[0];
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
}

async function fetchProducts() {
  const queryText = `
    SELECT * FROM products
    ORDER BY created_at DESC
    LIMIT 100;
  `;
  try {
    const res = await db.query(queryText);
    return res.rows;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
}

async function editProduct(id, data) {
  const query = `
    UPDATE products
    SET title = $1, description = $2, value = $3, amount = $4, relates_to = $5, image = $6
    WHERE id = $7
    RETURNING *;
  `;
  const values = [
    data.title,
    data.description,
    parseFloat(data.value),
    parseInt(data.amount, 10),
    data.relates_to,
    data.image || null,
    id,
  ];
  const res = await db.query(query, values);
  return res.rows[0];
}

async function removeProduct(id) {
  await db.query(`DELETE FROM products WHERE id = $1`, [id]);
}

module.exports = { createProduct, fetchProducts, editProduct, removeProduct };