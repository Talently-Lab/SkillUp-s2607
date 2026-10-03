const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
            select: false, // No devolver la contraseña por defecto en las consultas
        },
        role: {
            type: String,
            enum: ['student', 'admin'],
            default: 'student',
        },
        enrolledCourses: [
            {
                type: mongoose.Schema.Types.ObjectId, // Corregido: ObjectId con I mayúscula
                ref: 'Course',
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Método para comparar contraseñas en el Login
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);