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
            perfil VARCHAR(20) DEFAULT 'cidadao',
            primeiro_acesso BOOLEAN DEFAULT TRUE
        );
    `;
    await db.query(query); 
    
    try {
        await db.query(`ALTER TABLE utilizadores ADD COLUMN IF NOT EXISTS perfil VARCHAR(20) DEFAULT 'cidadao';`);
        await db.query(`ALTER TABLE utilizadores ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'cidadao';`);
        await db.query(`ALTER TABLE utilizadores ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;`);
        await db.query(`ALTER TABLE utilizadores ADD COLUMN IF NOT EXISTS bio TEXT;`);
        await db.query(`ALTER TABLE utilizadores ADD COLUMN IF NOT EXISTS primeiro_acesso BOOLEAN DEFAULT TRUE;`);
    } catch(err) {
        console.error('Erro ao adicionar colunas:', err);
    }
};

const createUser = async (userData) => {
    const { nome, email, senha, data_nascimento, imagem_perfil } = userData;
    const query = `
        INSERT INTO utilizadores (nome, email, senha, data_nascimento, imagem_perfil)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, nome, email, data_nascimento, imagem_perfil, perfil, primeiro_acesso;
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
    const query = `SELECT id, nome, email, data_nascimento, imagem_perfil, perfil, role, bio, is_private, primeiro_acesso FROM utilizadores WHERE id = $1;`;
    const result = await db.query(query, [id]);
    return result.rows[0];
};

const updateUserProfile = async (id, userData) => {
    const { nome, imagem_perfil, bio, is_private } = userData;
    const query = `
        UPDATE utilizadores 
        SET nome = COALESCE($1, nome), 
            imagem_perfil = COALESCE($2, imagem_perfil),
            bio = COALESCE($3, bio),
            is_private = COALESCE($4, is_private)
        WHERE id = $5
        RETURNING id, nome, email, data_nascimento, imagem_perfil, perfil, role, bio, is_private;
    `;
    const result = await db.query(query, [nome, imagem_perfil, bio, is_private, id]);
    return result.rows[0];
};

const disablePrimeiroAcesso = async (id) => {
    const query = `UPDATE utilizadores SET primeiro_acesso = false WHERE id = $1 RETURNING *;`;
    const result = await db.query(query, [id]);
    return result.rows[0];
};

module.exports = {
    createTable,
    createUser,
    findUserByEmail,
    findUserById,
    updateUserProfile,
    disablePrimeiroAcesso
};
