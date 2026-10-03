const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const config = require('../config/config');

app = express();
// Los middlewares basiscos 
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch((error) => console.error('Error al conectar a MongoDB:', error));

app.get('/', (req, res) => {
    res.json({ message: '¡Bienvenido a la API de Talenty!' });
});

app.listen(process.argv.PORT || 3000, () => {
    console.log(`Servidor escuchando en el puerto ${process.argv.PORT || 3000}`);
});

