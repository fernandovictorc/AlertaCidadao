require('dotenv').config();
const db = require('../src/config/db');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Verifica se o usuário já existe
        const checkQuery = 'SELECT * FROM utilizadores WHERE email = $1;';
        const checkRes = await db.query(checkQuery, ['admin@alertacidadao.pt']);
        
        if (checkRes.rows.length > 0) {
            console.log('Administrador já existe no banco de dados.');
        } else {
            const insertQuery = `
                INSERT INTO utilizadores (nome, email, senha, data_nascimento, perfil)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *;
            `;
            const values = ['Administrador', 'admin@alertacidadao.pt', hashedPassword, '1990-01-01', 'admin'];
            const res = await db.query(insertQuery, values);
            console.log('Administrador criado com sucesso:', res.rows[0].email);
        }
    } catch (err) {
        console.error('Erro ao semear administrador:', err);
    } finally {
        process.exit();
    }
};

seedAdmin();
