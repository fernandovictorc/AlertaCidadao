# Guia Definitivo: Banco de Dados e Apresentação do Projeto

## 1. Resumo: Como o site vai funcionar no computador do professor?

Para apresentar o "Alerta Cidadão" no computador do seu professor **sem precisar instalar nada lá** (nem PostgreSQL, nem Node.js, nem baixar arquivos do GitHub), nós vamos usar a estratégia de **Hospedagem em Nuvem (Cloud)**.

**O GitHub sozinho serve?**
**Não.** O *GitHub Pages* (a hospedagem gratuita do GitHub) só funciona para sites estáticos (apenas visual: HTML e CSS). O nosso projeto é robusto: ele tem um servidor rodando (Node.js/Express), validação de login (JWT), envio de e-mails e um Banco de Dados Relacional (PostgreSQL). O GitHub não roda nada disso.

**Como vai funcionar então?**
Nós vamos colocar o seu projeto em uma plataforma gratuita chamada **Render** (ou *Railway/Supabase*). 
1. O Render vai ler o seu código no GitHub.
2. O Render vai criar um "computador virtual" (servidor) só para você e rodar o nosso back-end (`node server.js`).
3. O Render também vai te dar um Banco de Dados PostgreSQL totalmente online.
4. No final, ele vai gerar um link público (exemplo: `https://alerta-cidadao.onrender.com`).

**Na hora da apresentação:** Você só precisará abrir o navegador no notebook do seu professor e digitar esse link. O site vai abrir completo, com o banco de dados salvando as denúncias de verdade, enviando e-mails e o painel de Admin funcionando perfeitamente!

---

## 2. Passo a Passo Manual: O que você precisa fazer

Já que você não baixou o PostgreSQL no seu computador, **não tem problema**. Na verdade, isso até facilita, pois vamos criar o banco de dados diretamente na nuvem!

Siga este roteiro minuciosamente:

### Passo A: Subir o projeto para o GitHub
Você precisa que todos os arquivos (HTML, CSS, `src`, `scripts`, `package.json`) estejam no seu repositório do GitHub. 
*Atenção à regra de segurança:* O arquivo `.env` **nunca** deve ir para o GitHub. Ele deve estar bloqueado pelo `.gitignore`.

### Passo B: Criar o Banco de Dados na Nuvem (Gratuito)
Vamos usar uma plataforma que oferece PostgreSQL de graça. A recomendação principal é o **Neon.tech** ou o **Supabase**.

1. Acesse o site do **Supabase** (https://supabase.com/) ou **Neon** (https://neon.tech/) e crie uma conta com seu GitHub.
2. Crie um "Novo Projeto" e dê o nome de `alerta-cidadao`. Ele vai gerar uma senha de banco de dados para você. Anote essa senha.
3. Após o projeto ser criado, procure pela aba de **Configurações do Banco de Dados (Database Settings)** e encontre a **Connection String (URI)**. Ela vai se parecer com isso:
   `postgresql://postgres:suasenha@db.xxxxx.supabase.co:5432/postgres`
4. Essa é a chave de ouro! Ela substitui tudo aquilo de `DB_USER`, `DB_HOST`, etc.

### Passo C: Configurar o seu `.env` local para se conectar com a nuvem
Mesmo que o banco esteja na nuvem, você pode testar e criar as tabelas a partir do seu próprio computador. Abra o seu arquivo `.env` e vamos mudar o jeito que nos conectamos:

Apague as linhas antigas (`DB_USER`, `DB_HOST`...) e coloque apenas:
```env
DATABASE_URL=sua_connection_string_copiada_no_passo_B
JWT_SECRET=sua_chave_secreta_super_segura

# Configurações de Envio de E-mail (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=adminalertacidadao@gmail.com
SMTP_PASS=alertacidadao123
```

*(Lembrete técnico: Para que o `db.js` leia essa `DATABASE_URL`, o código lá dentro precisará usar a propriedade `connectionString: process.env.DATABASE_URL` em vez de separar por Host e User. Isso é o padrão da indústria).*

### Passo D: Criar as Tabelas Magicamente
Agora que seu computador local sabe a senha do banco lá na nuvem (através do `.env`), abra o terminal do VS Code e rode os scripts que nós já criamos:

1. **Crie as tabelas:**
   ```bash
   node src/config/initDB.js
   ```
   *(Você verá no terminal: "Todas as tabelas foram criadas com sucesso!")*

2. **Crie a conta do Professor/Admin:**
   ```bash
   node scripts/seedAdmin.js
   ```
   *(Você verá: "Administrador criado com sucesso: admin@alertacidadao.pt")*

Pronto! Seu banco de dados existe e está estruturado com todos os nossos requisitos, tabelas, e com a conta administrativa blindada pelo JWT!

### Passo E: Hospedar o Servidor Web (Node.js)
1. Crie uma conta no **Render** (https://render.com/).
2. Clique em **New** > **Web Service**.
3. Conecte com o seu GitHub e escolha o repositório do `alerta-cidadao`.
4. Em **Build Command**, coloque: `npm install`
5. Em **Start Command**, coloque: `npm start`
6. Vá na aba de **Environment Variables** (dentro do Render) e adicione manualmente todas as variáveis que estão no seu `.env` (DATABASE_URL, JWT_SECRET, SMTP_USER, etc). 
   *(Isso é necessário porque o Render não tem acesso ao arquivo `.env` que ficou de fora do GitHub).*
7. Clique em **Create Web Service**.

Em poucos minutos, ele te dará o link público. Leve esse link para a sala de aula e arrase na apresentação!

