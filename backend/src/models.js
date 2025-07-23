const pool = require('./db');
const bcrypt = require('bcrypt');

// User
async function createUser(name, email, password) {
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
    [name, email, hash]
  );
  return rows[0];
}

async function findUserByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
}

// Transactions
async function addTransaction(user_id, amount, type, category, note, created_at) {
  const { rows } = await pool.query(
    'INSERT INTO transactions (user_id, amount, type, category, note, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [user_id, amount, type, category, note, created_at]
  );
  return rows[0];
}

async function getTransactions(user_id, filters = {}) {
  let query = 'SELECT * FROM transactions WHERE user_id = $1';
  let params = [user_id];
  if (filters.category) {
    params.push(filters.category);
    query += ` AND category = $${params.length}`;
  }
  if (filters.from && filters.to) {
    params.push(filters.from, filters.to);
    query += ` AND created_at BETWEEN $${params.length - 1} AND $${params.length}`;
  }
  query += ' ORDER BY created_at DESC';
  const { rows } = await pool.query(query, params);
  return rows;
}

async function deleteTransaction(user_id, id) {
  await pool.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [id, user_id]);
}

// Budgets
async function upsertBudget(user_id, month, total_amount) {
  const { rows } = await pool.query(
    `INSERT INTO budgets (user_id, month, total_amount)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, month) DO UPDATE SET total_amount = $3
     RETURNING *`,
    [user_id, month, total_amount]
  );
  return rows[0];
}

async function getBudgets(user_id) {
  const { rows } = await pool.query('SELECT * FROM budgets WHERE user_id = $1 ORDER BY month DESC', [user_id]);
  return rows;
}

// Savings Goals
async function createGoal(user_id, title, target_amount) {
  const { rows } = await pool.query(
    'INSERT INTO savings_goals (user_id, title, target_amount, current_amount) VALUES ($1, $2, $3, 0) RETURNING *',
    [user_id, title, target_amount]
  );
  return rows[0];
}

async function getGoals(user_id) {
  const { rows } = await pool.query('SELECT * FROM savings_goals WHERE user_id = $1', [user_id]);
  return rows;
}

async function saveToGoal(user_id, id, amount) {
  const { rows } = await pool.query(
    'UPDATE savings_goals SET current_amount = current_amount + $1 WHERE id = $2 AND user_id = $3 RETURNING *',
    [amount, id, user_id]
  );
  return rows[0];
}

module.exports = {
  createUser,
  findUserByEmail,
  addTransaction,
  getTransactions,
  deleteTransaction,
  upsertBudget,
  getBudgets,
  createGoal,
  getGoals,
  saveToGoal,
};