const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, async (req, res) => {
	try {
		const user = await User.findById(req.user.id)
			.select('-password')
			.populate('enrolledCourses');
		if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
		res.json(user);
	} catch (error) {
		res.status(500).json({ message: 'No se pudo cargar el panel personal' });
	}
});

router.post('/courses/:courseId/enroll', protect, async (req, res) => {
	try {
		const [user, course] = await Promise.all([
			User.findById(req.user.id),
			Course.findById(req.params.courseId),
		]);

		if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
		if (!course) return res.status(404).json({ message: 'Curso no encontrado' });
		if (user.enrolledCourses.some((id) => id.equals(course._id))) {
			return res.status(409).json({ message: 'Ya estás inscrito en este curso' });
		}

		user.enrolledCourses.push(course._id);
		course.students.push(user._id);
		await Promise.all([user.save(), course.save()]);

		res.status(201).json({ message: 'Inscripción realizada correctamente', course });
	} catch (error) {
		res.status(400).json({ message: 'No se pudo completar la inscripción' });
	}
});

router.delete('/courses/:courseId/enroll', protect, async (req, res) => {
	try {
		const [user, course] = await Promise.all([
			User.findById(req.user.id),
			Course.findById(req.params.courseId),
		]);

		if (!user || !course) return res.status(404).json({ message: 'Usuario o curso no encontrado' });

		user.enrolledCourses = user.enrolledCourses.filter((id) => !id.equals(course._id));
		course.students = course.students.filter((id) => !id.equals(user._id));
		await Promise.all([user.save(), course.save()]);

		res.json({ message: 'Inscripción cancelada correctamente' });
	} catch (error) {
		res.status(400).json({ message: 'No se pudo cancelar la inscripción' });
	}
});

module.exports = router;
