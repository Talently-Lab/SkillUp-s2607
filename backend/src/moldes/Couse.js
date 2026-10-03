const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del curso es obligatorio'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
    },
    // Relación con el modelo User (Profesor/Admin)
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El instructor es obligatorio'],
    },
    duration: {
      type: Number,
      required: [true, 'La duración es obligatoria'],
      min: [1, 'La duración debe ser de al menos 1 hora'],
    },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true,
    },
    // Lista de alumnos inscritos
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model('Course', courseSchema);