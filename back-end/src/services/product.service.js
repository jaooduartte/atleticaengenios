const db = require('../utils/db');

async function createProduct(productData) {
  const queryText = `
    INSERT INTO products (title, description, value, amount, relates_to, image, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *;
  `;
  const queryValues = [
    productData.name,
    productData.description,
    parseFloat(productData.value),
    parseInt(productData.amount, 10),
    productData.relates_to,
    productData.image || null
  ];
  try {
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

module.exports = { createProduct, fetchProducts };