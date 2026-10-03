const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const createToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email y password son obligatorios' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    const user = await User.create({ name, email, password });

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: createToken(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo registrar el usuario' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    return res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: createToken(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo iniciar sesión' });
  }
});

module.exports = router;