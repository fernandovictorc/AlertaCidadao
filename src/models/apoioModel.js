const db = require('../config/db');

const createTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS apoios (
            id SERIAL PRIMARY KEY,
            id_denuncia INTEGER REFERENCES denuncias(id) ON DELETE CASCADE,
            id_utilizador INTEGER REFERENCES utilizadores(id) ON DELETE CASCADE,
            UNIQUE(id_denuncia, id_utilizador)
        );
    `;
    await db.query(query);
};

const toggleApoio = async (id_denuncia, id_utilizador) => {
    // Verifica se já existe
    const checkQuery = `SELECT id FROM apoios WHERE id_denuncia = $1 AND id_utilizador = $2`;
    const checkResult = await db.query(checkQuery, [id_denuncia, id_utilizador]);

    if (checkResult.rows.length > 0) {
        // Remove apoio
        await db.query(`DELETE FROM apoios WHERE id_denuncia = $1 AND id_utilizador = $2`, [id_denuncia, id_utilizador]);
        await db.query(`UPDATE denuncias SET apoios_contagem = apoios_contagem - 1 WHERE id = $1`, [id_denuncia]);
        return { message: 'Apoio removido', apoiado: false };
    } else {
        // Adiciona apoio
        await db.query(`INSERT INTO apoios (id_denuncia, id_utilizador) VALUES ($1, $2)`, [id_denuncia, id_utilizador]);
        await db.query(`UPDATE denuncias SET apoios_contagem = apoios_contagem + 1 WHERE id = $1`, [id_denuncia]);
        return { message: 'Apoio adicionado', apoiado: true };
    }
};

module.exports = {
    createTable,
    toggleApoio
};
