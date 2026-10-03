const express = require('express');
const Course = require('../models/Course');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('students', 'name email');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'No se pudieron obtener los cursos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('students', 'name email');
    if (!course) return res.status(404).json({ message: 'Curso no encontrado' });
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: 'ID de curso inválido' });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: 'Datos de curso inválidos', error: error.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course) return res.status(404).json({ message: 'Curso no encontrado' });
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: 'No se pudo actualizar el curso', error: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Curso no encontrado' });
    res.json({ message: 'Curso eliminado correctamente' });
  } catch (error) {
    res.status(400).json({ message: 'ID de curso inválido' });
  }
});

module.exports = router;