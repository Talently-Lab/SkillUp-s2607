const mongoose = require('mongoose');

// Importa tu modelo de Mongoose (asegúrate de ajustar la ruta si está en otro archivo)
// const Course = require('./models/Course'); 

const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skillup_db');
        console.log('Conectado a MongoDB');

        const nuevoCurso = new Course({
            title: 'Desarrollo Backend con Node.js',
            description: 'Aprende a crear APIs REST profesionales desde cero.',
            instructor: 'Lucas Ugarte',
            duration: 8, // 8 semanas según el MVP
            category: 'Programación',
            students: 0
        });

        // Guardar en la base de datos
        const cursoGuardado = await nuevoCurso.save();
        console.log("¡El modelo funciona perfectamente! Curso guardado con éxito:");
        console.log(cursoGuardado);

        process.exit(0);
    } catch (error) {
        console.error('Error conectando a MongoDB o guardando el curso:', error);
        process.exit(1);
    }
};

module.exports = conectarDB;
