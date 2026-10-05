const db = require('../config/db');

const createTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS utilizadores (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            senha VARCHAR(255) NOT NULL,
            data_nascimento DATE NOT NULL,
            imagem_perfil TEXT,
            perfil VARCHAR(20) DEFAULT 'cidadao'
        );
    `;
    await db.query(query); 
    
    try {
        await db.query(`ALTER TABLE utilizadores ADD COLUMN IF NOT EXISTS perfil VARCHAR(20) DEFAULT 'cidadao';`);
    } catch(err) {
        console.error('Erro ao adicionar coluna perfil (pode já existir):', err);
    }
};

const createUser = async (userData) => {
    const { nome, email, senha, data_nascimento, imagem_perfil } = userData;
    const query = `
        INSERT INTO utilizadores (nome, email, senha, data_nascimento, imagem_perfil)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, nome, email, data_nascimento, imagem_perfil, perfil;
    `;
    const values = [nome, email, senha, data_nascimento, imagem_perfil || null];
    const result = await db.query(query, values);
    return result.rows[0];
};

const findUserByEmail = async (email) => {
    const query = `SELECT * FROM utilizadores WHERE email = $1;`;
    const result = await db.query(query, [email]);
    return result.rows[0];
};

const findUserById = async (id) => {
    const query = `SELECT id, nome, email, data_nascimento, imagem_perfil, perfil FROM utilizadores WHERE id = $1;`;
    const result = await db.query(query, [id]);
    return result.rows[0];
};

const updateUserProfile = async (id, userData) => {
    const { nome, imagem_perfil } = userData;
    const query = `
        UPDATE utilizadores 
        SET nome = $1, imagem_perfil = $2
        WHERE id = $3
        RETURNING id, nome, email, data_nascimento, imagem_perfil, perfil;
    `;
    const result = await db.query(query, [nome, imagem_perfil, id]);
    return result.rows[0];
};

module.exports = {
    createTable,
    createUser,
    findUserByEmail,
    findUserById,
    updateUserProfile
};
