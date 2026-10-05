# Atualização Back-End (05/10/2026)

## 1. O que foi feito (Resumo)

Conforme o planejamento e requisitos propostos em `.agents/rules/apresentacao_e_admin.md`, o back-end foi meticulosamente atualizado para suportar o perfil de administrador, enviar e-mails de notificação ao atualizar os status das denúncias e aplicar a segurança necessária usando os tokens JWT e middlewares específicos.

### Arquivos Modificados / Criados:
- **`src/models/userModel.js`**: Atualizado para incluir a coluna `perfil` (com valor padrão 'cidadao') na criação da tabela. Além disso, adicionou-se um comando `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` para que, caso a tabela já exista, o sistema apenas adicione a coluna, evitando a necessidade de reconstruir o banco. As consultas (`SELECT` e `RETURNING`) foram atualizadas para devolver o `perfil`.
- **`src/controllers/userController.js`**: Atualizado para injetar a propriedade `perfil` no token JWT e retorná-la para o front-end na resposta do login.
- **`src/middleware/adminAuthMiddleware.js`**: Criado. Valida se o usuário tem a role `admin`. Depende do middleware `verifyToken` ser invocado antes dele.
- **`src/controllers/denunciaController.js`**: Criado o método `updateStatus(req, res)` que:
  1. Verifica se a denúncia existe.
  2. Atualiza o status no banco de dados.
  3. Utiliza a biblioteca `nodemailer` para enviar um e-mail de notificação para o autor da denúncia (caso este possua preferência por e-mail e não seja anônimo).
- **`src/routes/denunciaRoutes.js`**: Adicionada a rota `PATCH /:id/estado`, protegida primeiro pelo `verifyToken` e logo em seguida pelo `adminAuthMiddleware`.
- **`scripts/seedAdmin.js`**: Criado script Node.js standalone para verificar e inserir (caso não exista) o usuário admin inicial (`admin@alertacidadao.pt` / `admin123`).

---

## 2. Tabelas do Banco de Dados (Schemas Atualizados)

As tabelas finais contêm as seguintes estruturas (de acordo com as últimas implementações feitas no código):

### Tabela `utilizadores`
\`\`\`sql
CREATE TABLE IF NOT EXISTS utilizadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    imagem_perfil TEXT,
    perfil VARCHAR(20) DEFAULT 'cidadao'
);
\`\`\`

### Tabela `denuncias` (Apenas para referência)
\`\`\`sql
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
\`\`\`

---

## 3. Tarefas Manuais Necessárias (Ação Requerida)

Para que todas estas atualizações entrem em vigor corretamente e não ocorram erros no servidor, você precisa executar os seguintes passos no terminal (garanta que está na pasta `AlertaCidadão`):

### Passo 1: Instalar dependência de envio de e-mails
Abra seu terminal na raiz do projeto (\`c:\\Users\\ferna\\Documents\\Projetos\\CURSOONP\\javascript\\AlertaCidadão\`) e instale o pacote de e-mails (`nodemailer`):
\`\`\`bash
npm install nodemailer
\`\`\`

### Passo 2: Atualizar o arquivo `.env`
O módulo que envia e-mails usa configurações SMTP. Abra o arquivo `.env` na raiz do projeto (se não existir, crie-o) e adicione as seguintes linhas (troque pelas suas reais de serviço de email, como Gmail, Mailtrap, etc):
\`\`\`env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=adminalertacidadao@gmail.com
SMTP_PASS=alertacidadao123
\`\`\`

### Passo 3: Executar as migrações (se necessário) e o Seeder
Você deve rodar o script de inicialização do banco, que agora adicionará a coluna de perfil caso não exista. Depois, criar o usuário admin. Execute no terminal:
\`\`\`bash
node src/config/initDB.js
node scripts/seedAdmin.js
\`\`\`

*Nota: Se aparecer a mensagem "Administrador criado com sucesso: admin@alertacidadao.pt", significa que você já pode fazer login no app usando `admin@alertacidadao.pt` e a senha `admin123`.*

### Passo 4: Reiniciar a Aplicação
Feche o terminal do servidor antigo (com `Ctrl + C`) e execute o projeto novamente.
\`\`\`bash
npm run dev
\`\`\`
(ou `npm start`)
