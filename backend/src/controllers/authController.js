const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Función auxiliar para firmar el JWT
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'El correo electrónico ya está registrado',
            });
        }

        // 2. Crear el nuevo usuario (el hash de contraseña se ejecuta en el pre('save') del Schema)
        const newUser = await User.create({ name, email, password, role });

        // 3. Generar token
        const token = signToken(newUser._id);

        // 4. Limpiar datos sensibles para la respuesta
        newUser.password = undefined;

        res.status(201).json({
            success: true,
            message: 'Usuario registrado con éxito',
            data: { user: newUser, token },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Error al registrar el usuario',
        });
    }
};

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Por favor ingrese email y contraseña',
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                success: false,
                error: 'Nombre de usuario o contraseña incorrectos',
            });
        }

        const token = signToken(user._id);
        user.password = undefined;

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: { user, token },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Error al iniciar sesión',
        });
    }
};

// @desc    Obtener datos del usuario actualmente autenticado
// @route   GET /api/auth/me
// @access  Private (Requiere authMiddleware)
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('enrolledCourses');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado',
            });
        }

        res.status(200).json({ success: true, data: { user } });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener datos del usuario',
        });
    }
};