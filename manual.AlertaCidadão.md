# Manual Completo - Alerta Cidadão

Este é o guia definitivo e unificado do projeto "Alerta Cidadão". Ele contém toda a explicação do backend, o esquema completo das tabelas do banco de dados e o passo a passo detalhado do que você precisa fazer para colocar o projeto no ar (no GitHub e na Nuvem) para a apresentação ao seu professor.

---

## 1. Visão Geral e Plano de Projeto

Para apresentar o "Alerta Cidadão" no computador do seu professor **sem precisar instalar nada lá** (nem PostgreSQL, nem Node.js, nem baixar arquivos do GitHub), nós vamos usar a estratégia de **Hospedagem em Nuvem (Cloud)**.

O GitHub Pages não serve para esse projeto, pois ele é robusto: possui um servidor rodando (Node.js/Express), validação de login (JWT), envio de e-mails e um Banco de Dados Relacional (PostgreSQL). 

**Como vai funcionar:**
1. O seu código ficará no **GitHub**.
2. Usaremos o **Supabase** (ou Neon) para criar um Banco de Dados PostgreSQL totalmente online e gratuito.
3. Usaremos o **Render** para criar um servidor virtual que lerá o código do GitHub, se conectará ao banco de dados e deixará o site no ar (exemplo: `https://alerta-cidadao.onrender.com`).
4. **Na hora da apresentação:** Você só precisará abrir o navegador no notebook do seu professor e digitar o link público. O site vai abrir completo, salvando denúncias, enviando e-mails e com o painel Admin funcionando!

---

## 2. Estrutura do Backend e Regras de Negócio

O backend foi construído em Node.js com Express, seguindo a arquitetura em camadas MVC (Models, Controllers, Routes).

*   **Configuração (`src/config/`)**: 
    *   `db.js`: Configura a conexão com o banco PostgreSQL.
    *   `initDB.js`: Script ("Harness") que cria todas as tabelas caso não existam.
*   **Middlewares (`src/middleware/`)**:
    *   `authMiddleware.js`: Valida o JWT para proteger rotas privadas (perfil, criar denúncia).
    *   `adminAuthMiddleware.js`: Valida se o usuário tem a role `admin`.
*   **Controladores (`src/controllers/`)**:
    *   `userController.js`: Lida com registro, login (geração de JWT) e edição de perfil (com hash de senha via bcrypt). Injeta a propriedade `perfil` no token.
    *   `denunciaController.js`: Criação de denúncias, listagem, toggle de apoios e atualização de status (que usa `nodemailer` para enviar e-mails de notificação ao autor).
    *   `comentariosController.js`: Postagem e listagem de comentários.
*   **Integração (`public/js/api.js`)**: Concentra todas as funções (Fetch API) que se comunicam com o backend de forma real, sem usar dados falsos (mocks).

---

## 3. Esquema do Banco de Dados (Tabelas)

O banco de dados é composto por 5 tabelas principais. Você não precisa criá-las manualmente no painel SQL, pois o nosso script (`initDB.js`) faz isso por você. Mas aqui está a estrutura exata de como elas funcionam:

### 1. `utilizadores`
Armazena os dados dos usuários e administradores.
```sql
CREATE TABLE IF NOT EXISTS utilizadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    imagem_perfil TEXT,
    perfil VARCHAR(20) DEFAULT 'cidadao'
);
```

### 2. `denuncias`
Armazena os relatos de problemas na cidade.
```sql
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
```

### 3. `midias`
Guarda as fotos e vídeos anexados nas denúncias.
```sql
CREATE TABLE IF NOT EXISTS midias (
    id SERIAL PRIMARY KEY,
    id_denuncia INTEGER REFERENCES denuncias(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL,
    url_ou_base64 TEXT NOT NULL
);
```

### 4. `apoios`
Garante que 1 usuário dê apenas 1 apoio por denúncia.
```sql
CREATE TABLE IF NOT EXISTS apoios (
    id SERIAL PRIMARY KEY,
    id_denuncia INTEGER REFERENCES denuncias(id) ON DELETE CASCADE,
    id_utilizador INTEGER REFERENCES utilizadores(id) ON DELETE CASCADE,
    UNIQUE(id_denuncia, id_utilizador)
);
```

### 5. `comentarios`
Fórum comunitário focado na denúncia.
```sql
CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    id_denuncia INTEGER REFERENCES denuncias(id) ON DELETE CASCADE,
    id_utilizador INTEGER REFERENCES utilizadores(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Passo a Passo Definitivo (O que você precisa fazer agora)

Siga este roteiro minuciosamente para preparar o banco de dados, criar o seu `.env` e subir o projeto:

### Passo 1: Subir o projeto para o GitHub
Adicione todos os arquivos do projeto (HTML, CSS, `src`, `scripts`, `package.json`) no seu repositório do GitHub.
**Regra de Ouro:** O arquivo `.env` **NUNCA** deve ser enviado para o GitHub. Ele deve ficar no seu PC e ser ignorado pelo `.gitignore`.

### Passo 2: Criar o Banco de Dados na Nuvem (Supabase)
1. Acesse o **Supabase** (https://supabase.com/) e crie uma conta com seu GitHub.
2. Crie um "Novo Projeto" chamado `alerta-cidadao`. Defina uma senha para o banco de dados (anote-a).
3. Vá nas **Configurações (Database Settings)** e copie a **Connection String (URI)**. Ela será algo como:
   `postgresql://postgres:SUA_SENHA@db.xxxxx.supabase.co:5432/postgres`

### Passo 3: Configurar o seu `.env` local (BEM MASTIGADO)
Crie ou edite o arquivo `.env` na pasta raiz do projeto (`AlertaCidadão`) e cole exatamente o código abaixo, substituindo apenas os valores indicados pelos seus reais:

```env
# URL do Banco de Dados (Substitua pela chave do Supabase)
DATABASE_URL=postgresql://postgres:sua_senha_aqui@db.xxxxx.supabase.co:5432/postgres

# Chave Secreta para Segurança dos Logins (Pode deixar essa)
JWT_SECRET=super_chave_secreta_alerta_cidadao_2026

# Configurações de Envio de E-mail (Para notificações de mudança de status)
# Você pode usar um email real do Gmail e gerar uma "Senha de App" nas configurações do Google
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email_real@gmail.com
SMTP_PASS=sua_senha_de_aplicativo_do_google
```

### Passo 4: Instalar as dependências e criar as Tabelas (Via Terminal)
Abra o terminal do VS Code na pasta do projeto e execute os seguintes comandos:

1. **Garantir que a biblioteca de e-mails está instalada:**
   ```bash
   npm install nodemailer
   ```
2. **Criar todas as tabelas no Supabase magicamente:**
   ```bash
   node src/config/initDB.js
   ```
   *(Você verá a mensagem: "Todas as tabelas foram criadas com sucesso!")*
3. **Criar a conta do Administrador:**
   ```bash
   node scripts/seedAdmin.js
   ```
   *(Você verá a mensagem confirmando que o admin foi criado. Você já poderá logar com `admin@alertacidadao.pt` e senha `admin123`)*

Neste ponto, você já pode testar o projeto no seu computador rodando `npm start`. Se tudo funcionar, vamos para o passo final!

### Passo 5: Hospedar o Servidor Web no Render
1. Crie uma conta no **Render** (https://render.com/).
2. Clique em **New** > **Web Service**.
3. Conecte com o seu GitHub e escolha o repositório do `alerta-cidadao`.
4. Em **Build Command**, coloque: `npm install`
5. Em **Start Command**, coloque: `node server.js` (ou `npm start`)
6. **MUITO IMPORTANTE:** Vá na seção **Environment Variables** (dentro do painel do Render) e adicione as variáveis de ambiente exatamente como você colocou no seu `.env` local:
   - `DATABASE_URL` = `postgresql://...`
   - `JWT_SECRET` = `super_chave_secreta_alerta_cidadao_2026`
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `seu_email_real@gmail.com`
   - `SMTP_PASS` = `sua_senha_de_aplicativo_do_google`
7. Clique em **Create Web Service**.

Aguarde alguns minutos. O Render vai fazer o deploy e te dará um link público (ex: `https://alerta-cidadao.onrender.com`).
Pronto! É só abrir esse link no computador do professor e apresentar o seu projeto 100% funcional.
