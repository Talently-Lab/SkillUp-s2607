const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
 
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado o formato incorrecto' });
  } 
  try {
    const token = authorization.split(' ')[1];
    req.use = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado: solo administradores' });

    }
    next();
};

module.exports = { authenticateToken, adminOnly };
