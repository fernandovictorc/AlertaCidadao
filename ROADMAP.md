# Roadmap Alerta Cidadão

Este documento contém o planejamento de futuras páginas, banco de dados e integrações com base nas solicitações para o projeto Alerta Cidadão.

## 1. Frontend (Próximas Páginas)
Todas as novas páginas devem seguir estritamente o padrão criado em `public/index.html`, importando `agnostico.css` e `projeto.css`. O design system e as variáveis de UI (baseadas em Product Hunt, mas voltadas para tons verdes) devem ser mantidos.

### Páginas a Desenvolver
- **Página de Login e Cadastro (Perfil):** Interfaces modulares usando `forms.css` para entrada de dados de usuários.
- **Página Específica da Denúncia (Mídia Social):** Ao clicar em um card de denúncia (ex: *Buraco na Avenida*), o usuário será levado para uma página detalhada contendo a discussão completa (semelhante a uma thread de rede social), fotos adicionais, atualizações da prefeitura e espaço para comentários.
- **Página de Perfil do Usuário:** Para acompanhar suas denúncias publicadas e pontuação de engajamento comunitário.

## 2. Backend e Banco de Dados (Futuro)
A arquitetura de pastas está preparada para receber o backend Node.js. 

### Modelagem de Dados
- **Tabela `Usuarios`**: ID, Nome, Email, Senha, Role (Cidadão, Órgão Público).
- **Tabela `Denuncias`**: ID, Título, Descrição, Foto (URL), Status (Aberto, Em Análise, Resolvido), Categoria (Infraestrutura, Limpeza, Iluminação), ID do Usuário.
- **Tabela `Apoios`**: Relacionamento N:N entre `Usuarios` e `Denuncias` (semelhante aos *upvotes* do Product Hunt).
- **Tabela `Comentarios`**: ID, Texto, ID_Usuario, ID_Denuncia.

### Lógica da API
- Rotas RESTFul completas (`/api/denuncias`, `/api/users`, etc.) gerenciadas dentro de `src/routes/` e `src/controllers/`.
- Uso de JWT para controle de sessões e rotas privadas (como apoiar ou criar uma nova denúncia).

---
*Nota: A página principal (Feed de Denúncias) já se encontra implementada usando componentes flexíveis, e o seu layout será facilmente renderizado de forma dinâmica quando conectarmos a base de dados.*
