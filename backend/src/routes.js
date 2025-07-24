const express = require('express');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./middleware');
const models = require('./models');

const router = express.Router();

// Auth
router.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await models.createUser(name, email, password);
    res.json(user);
  } catch (e) {
    res.status(400).json({ message: 'Registration failed', error: e.message });
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await models.findUserByEmail(email);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const valid = await require('bcrypt').compare(password, user.password_hash);
  if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// Transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  const filters = {
    category: req.query.category,
    from: req.query.from,
    to: req.query.to,
  };
  const txs = await models.getTransactions(req.user.id, filters);
  res.json(txs);
});

router.post('/transactions', authenticateToken, async (req, res) => {
  const { amount, type, category, note, created_at } = req.body;
  const tx = await models.addTransaction(req.user.id, amount, type, category, note, created_at || new Date());
  res.json(tx);
});

router.delete('/transactions/:id', authenticateToken, async (req, res) => {
  await models.deleteTransaction(req.user.id, req.params.id);
  res.json({ success: true });
});

// Budgets
router.get('/budgets', authenticateToken, async (req, res) => {
  const budgets = await models.getBudgets(req.user.id);
  res.json(budgets);
});

router.post('/budgets', authenticateToken, async (req, res) => {
  const { month, total_amount } = req.body;
  const budget = await models.upsertBudget(req.user.id, month, total_amount);
  res.json(budget);
});

// Goals
router.get('/goals', authenticateToken, async (req, res) => {
  const goals = await models.getGoals(req.user.id);
  res.json(goals);
});

router.post('/goals', authenticateToken, async (req, res) => {
  const { title, target_amount } = req.body;
  const goal = await models.createGoal(req.user.id, title, target_amount);
  res.json(goal);
});

router.patch('/goals/:id/save', authenticateToken, async (req, res) => {
  const { amount } = req.body;
  const goal = await models.saveToGoal(req.user.id, req.params.id, amount);
  res.json(goal);
});

module.exports = router;