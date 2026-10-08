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

const userModel = require('./src/models/userModel');
const denunciaModel = require('./src/models/denunciaModel');
const apoioModel = require('./src/models/apoioModel');

// Inicialização (Harness)
const startServer = async () => {
    try {
        await userModel.createTable();
        await denunciaModel.createTable();
        if (apoioModel && apoioModel.createTable) {
            await apoioModel.createTable();
        }
        console.log('Tabelas da base de dados verificadas/criadas com sucesso.');
    } catch (error) {
        console.error('Erro ao inicializar tabelas:', error);
    }

    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
};

startServer();
