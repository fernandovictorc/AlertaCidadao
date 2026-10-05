const db = require('./db');
const userModel = require('../models/userModel');
const denunciaModel = require('../models/denunciaModel');
const midiasModel = require('../models/midiasModel');
const apoioModel = require('../models/apoioModel');
const comentariosModel = require('../models/comentariosModel');

const initDatabase = async () => {
    try {
        console.log('Iniciando criação das tabelas...');
        await userModel.createTable();
        console.log('Tabela utilizadores criada/verificada.');
        
        await denunciaModel.createTable();
        console.log('Tabela denuncias criada/verificada.');
        
        await midiasModel.createTable();
        console.log('Tabela midias criada/verificada.');
        
        await apoioModel.createTable();
        console.log('Tabela apoios criada/verificada.');
        
        await comentariosModel.createTable();
        console.log('Tabela comentarios criada/verificada.');
        
        console.log('Todas as tabelas foram criadas com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('Erro ao inicializar o banco de dados:', error);
        process.exit(1);
    }
};

initDatabase();
