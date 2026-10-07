const db = require('../config/db');

const createTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS midias (
            id SERIAL PRIMARY KEY,
            id_denuncia INTEGER REFERENCES denuncias(id) ON DELETE CASCADE,
            tipo VARCHAR(20) NOT NULL,
            url_ou_base64 TEXT NOT NULL
        );
    `;
    await db.query(query);
};

const addMidia = async (id_denuncia, tipo, url_ou_base64) => {
    const query = `
        INSERT INTO midias (id_denuncia, tipo, url_ou_base64)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const result = await db.query(query, [id_denuncia, tipo, url_ou_base64]);
    return result.rows[0];
};

const getMidiasByDenuncia = async (id_denuncia) => {
    const query = `SELECT * FROM midias WHERE id_denuncia = $1;`;
    const result = await db.query(query, [id_denuncia]);
    return result.rows;
};

module.exports = {
    createTable,
    addMidia,
    getMidiasByDenuncia
};
