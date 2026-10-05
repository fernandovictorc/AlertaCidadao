const db = require('../config/db');

const createTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS denuncias (
            id SERIAL PRIMARY KEY,
            id_utilizador INTEGER REFERENCES utilizadores(id) ON DELETE CASCADE,
            titulo VARCHAR(150) NOT NULL,
            descricao TEXT NOT NULL,
            morada VARCHAR(255) NOT NULL,
            bairro VARCHAR(100) NOT NULL,
            estado VARCHAR(50) DEFAULT 'Não Respondido',
            apoios_contagem INTEGER DEFAULT 0,
            data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            anonimo BOOLEAN DEFAULT FALSE,
            privado BOOLEAN DEFAULT FALSE,
            notificacao_pref VARCHAR(20) DEFAULT 'email'
        );
    `;
    await db.query(query);
};

const createDenuncia = async (denunciaData) => {
    const { id_utilizador, titulo, descricao, morada, bairro, anonimo, privado, notificacao_pref } = denunciaData;
    const query = `
        INSERT INTO denuncias (id_utilizador, titulo, descricao, morada, bairro, anonimo, privado, notificacao_pref)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;
    const values = [id_utilizador, titulo, descricao, morada, bairro, anonimo, privado, notificacao_pref];
    const result = await db.query(query, values);
    return result.rows[0];
};

const getAllPublicDenuncias = async () => {
    const query = `
        SELECT d.*, 
               CASE WHEN d.anonimo = true THEN 'Anônimo' ELSE u.nome END as nome_autor,
               CASE WHEN d.anonimo = true THEN null ELSE u.imagem_perfil END as imagem_autor
        FROM denuncias d
        LEFT JOIN utilizadores u ON d.id_utilizador = u.id
        WHERE d.privado = false
        ORDER BY d.data DESC;
    `;
    const result = await db.query(query);
    return result.rows;
};

const getAllDenunciasAdmin = async () => {
    const query = `
        SELECT d.*, 
               u.nome as nome_autor,
               u.imagem_perfil as imagem_autor
        FROM denuncias d
        LEFT JOIN utilizadores u ON d.id_utilizador = u.id
        ORDER BY d.data DESC;
    `;
    const result = await db.query(query);
    return result.rows;
};

const getDenunciaById = async (id) => {
    const query = `
        SELECT d.*, 
               CASE WHEN d.anonimo = true THEN 'Anônimo' ELSE u.nome END as nome_autor,
               CASE WHEN d.anonimo = true THEN null ELSE u.imagem_perfil END as imagem_autor
        FROM denuncias d
        LEFT JOIN utilizadores u ON d.id_utilizador = u.id
        WHERE d.id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
};

const updateStatus = async (id, status) => {
    const query = `
        UPDATE denuncias
        SET estado = $1
        WHERE id = $2
        RETURNING *;
    `;
    const result = await db.query(query, [status, id]);
    return result.rows[0];
};

module.exports = {
    createTable,
    createDenuncia,
    getAllPublicDenuncias,
    getAllDenunciasAdmin,
    getDenunciaById,
    updateStatus
};
