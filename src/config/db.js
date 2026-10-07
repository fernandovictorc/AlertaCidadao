const { Pool } = require('pg');
require('dotenv').config();

// Padrão do Harness: Conexão com banco relacional (PostgreSQL)
// Suporta tanto Connection String (Nuvem) quanto variáveis separadas (Local)
const poolConfig = process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
    };

// Define timeout para falhar rápido e evitar carregamento infinito no frontend
poolConfig.connectionTimeoutMillis = 5000;
poolConfig.idleTimeoutMillis = 10000;

const pool = new Pool(poolConfig);

// Testar a conexão (Harness base)
pool.on('connect', () => {
    console.log('Conexão ao banco de dados PostgreSQL estabelecida com sucesso.');
});

module.exports = {
    // Exporta a função de query para permitir Prepared Statements em todos os models
    query: (text, params) => pool.query(text, params),
};
