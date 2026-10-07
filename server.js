require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Respostas estritamente em formato JSON e limite aumentado para base64
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Rotas
const userRoutes = require('./src/routes/userRoutes');
const denunciaRoutes = require('./src/routes/denunciaRoutes');


    app.use('/api/users', userRoutes);
    app.use('/api/denuncias', denunciaRoutes);

// Servir arquivos estáticos do frontend (Atenção: Os ficheiros estáticos devem ser movidos para a pasta public/)
app.use(express.static('public'));

// Inicialização (Harness)
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
