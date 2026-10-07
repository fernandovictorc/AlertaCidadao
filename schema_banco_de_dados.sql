-- Arquivo SQL Completo para criação do Banco de Dados do Alerta Cidadão
-- Copie e cole todo o conteúdo abaixo no painel SQL do Supabase ou Neon.tech

-- 1. Tabela de Utilizadores
CREATE TABLE IF NOT EXISTS utilizadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    imagem_perfil TEXT,
    perfil VARCHAR(20) DEFAULT 'cidadao'
);

-- 2. Tabela de Denúncias
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

-- 3. Tabela de Mídias
CREATE TABLE IF NOT EXISTS midias (
    id SERIAL PRIMARY KEY,
    id_denuncia INTEGER REFERENCES denuncias(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL,
    url_ou_base64 TEXT NOT NULL
);

-- 4. Tabela de Apoios
CREATE TABLE IF NOT EXISTS apoios (
    id SERIAL PRIMARY KEY,
    id_denuncia INTEGER REFERENCES denuncias(id) ON DELETE CASCADE,
    id_utilizador INTEGER REFERENCES utilizadores(id) ON DELETE CASCADE,
    UNIQUE(id_denuncia, id_utilizador)
);

-- 5. Tabela de Comentários
CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    id_denuncia INTEGER REFERENCES denuncias(id) ON DELETE CASCADE,
    id_utilizador INTEGER REFERENCES utilizadores(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Inserir Administrador Padrão 
-- Email: admin@alertacidadao.pt 
-- Senha: admin123
INSERT INTO utilizadores (nome, email, senha, data_nascimento, perfil)
VALUES (
    'Administrador', 
    'admin@alertacidadao.pt', 
    '$2b$10$3ac6lFqalxKCFYZdgiUli.f8S5gK/OcTvxMo5g0CmgeFCw7oKZ88W', 
    '1990-01-01', 
    'admin'
) ON CONFLICT (email) DO NOTHING;
