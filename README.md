# Alerta Cidadão

O "Alerta Cidadão" é um sistema focado em receber relatos, denúncias e enviar alertas para a comunidade. 

## Estrutura do Projeto

O projeto segue um padrão MVC para o backend em Node.js (com Express) e serve o frontend como arquivos estáticos a partir da pasta `public/`.

- **`public/`**: Frontend (HTML, CSS em `assets/css/`, JS em `js/`).
- **`src/`**: Backend (Controllers, Models, Routes, Middlewares).
- **`.agents/`**: Configurações e diretrizes de agentes.
- **`docs/`**: Documentação complementar (BD, atualizações).
- **`scripts/`**: Scripts auxiliares e scrapers.

## Como Executar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha com os dados do seu banco de dados PostgreSQL.
3. Inicie o servidor:
   ```bash
   npm start
   ```

O servidor estará rodando na porta padrão 3000 (ou na definida no `.env`). Acesse `http://localhost:3000` no seu navegador.
