# Projeto Alerta Cidadão - Contexto Global

Este arquivo serve como guia de instruções e contexto geral para o projeto Alerta Cidadão.

## Objetivos do Projeto
Desenvolver o sistema "Alerta Cidadão", focado em relatórios e alertas para a comunidade.

## Estrutura do Projeto
- `.agents/`: Arquivos de configuração, regras e scripts para agentes autônomos.
- `public/`: Arquivos do frontend (estáticos e lógicos) servidos para o cliente.
  - `public/assets/css/`: Estilos CSS modulares baseados em Flexbox e utility classes (ex: layout.css, cards.css, forms.css).
  - `public/js/`: Scripts para consumo da API REST e manipulação de interface (ex: api.js, ui.js).
- `src/`: Código-fonte do backend (API Node.js).
  - `src/config/`: Arquivos de configuração, incluindo a conexão com a base de dados relacional.
  - `src/controllers/`: Controladores para a lógica de negócio (CRUD de utilizadores e denúncias, incremento de apoios).
  - `src/models/`: Definições e interação com os dados (tabelas: utilizadores, denuncias, apoios).
  - `src/routes/`: Definições das rotas REST da API.
- `server.js`: Ponto de entrada principal do servidor Node.js que inicializa o backend e serve o public.

## Estrutura de Diretórios Esperada
/alertacidadao
  /.agents
    /rules          (Regras locais e comportamentos)
      mapa_site.md  (Especificação Funcional e Mapa do Site)
      seguranca.md  (Diretrizes de Segurança e Cibersegurança)
  /public           (Frontend - Interface do utilizador)
    index.html      (Ponto de entrada do frontend)
    /assets         (Imagens e estilos)
      /css          (Arquitetura de estilos modulares)
        agnostico.css (CSS Global/Agnóstico - Flexbox, utilitários)
        projeto.css   (CSS Específico - Identidade visual, cores)
    /js             (Lógica de frontend)
      api.js        (Funções fetch para comunicação com o backend)
      ui.js         (Manipulação do DOM e renderização)
  /src              (Backend - Node.js API)
    /config         (Configuração do servidor)
      db.js         (Conexão com a base de dados relacional)
    /controllers    (Lógica de negócio)
      userController.js
      denunciaController.js
    /models         (Interação com as tabelas da BD)
      userModel.js
      denunciaModel.js
      apoioModel.js
    /routes         (Endpoints da API REST)
      userRoutes.js
      denunciaRoutes.js
  server.js         (Ponto de entrada do servidor backend)
  package.json      (Dependências e scripts Node.js)
  GEMINI.md         (Contexto global do projeto)
