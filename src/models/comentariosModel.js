const db = require('../config/db');

const createTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS comentarios (
            id SERIAL PRIMARY KEY,
            id_denuncia INTEGER REFERENCES denuncias(id) ON DELETE CASCADE,
            id_utilizador INTEGER REFERENCES utilizadores(id) ON DELETE CASCADE,
            texto TEXT NOT NULL,
            data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    await db.query(query);
};

const createComentario = async (comentarioData) => {
    const { id_denuncia, id_utilizador, texto } = comentarioData;
    const query = `
        INSERT INTO comentarios (id_denuncia, id_utilizador, texto)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const result = await db.query(query, [id_denuncia, id_utilizador, texto]);
    return result.rows[0];
};

const getComentariosByDenuncia = async (id_denuncia) => {
    const query = `
        SELECT c.*, u.nome as nome_autor, u.imagem_perfil as imagem_autor
        FROM comentarios c
        JOIN utilizadores u ON c.id_utilizador = u.id
        WHERE c.id_denuncia = $1
        ORDER BY c.data ASC;
    `;
    const result = await db.query(query, [id_denuncia]);
    return result.rows;
};

const getComentarioById = async (id_comentario) => {
    const query = `SELECT * FROM comentarios WHERE id = $1;`;
    const result = await db.query(query, [id_comentario]);
    return result.rows[0];
};

const deleteComentario = async (id_comentario) => {
    const query = `DELETE FROM comentarios WHERE id = $1;`;
    await db.query(query, [id_comentario]);
};

module.exports = {
    createTable,
    createComentario,
    getComentariosByDenuncia,
    getComentarioById,
    deleteComentario
};
