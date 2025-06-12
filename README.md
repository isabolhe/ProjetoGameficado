# Projeto Gameficado

## Descrição

Projeto Gameficado é uma aplicação web gamificada para gerenciamento de atividades e recompensas voltada para responsáveis e seus filhos. O sistema permite que responsáveis cadastrem seus filhos, criem atividades com pontuação, acompanhem o progresso das atividades, e gerenciem prêmios que podem ser resgatados com os pontos acumulados pelas crianças.

## Funcionalidades Principais

- Cadastro e login de responsáveis e filhos.
- Autenticação via JWT para segurança das rotas protegidas.
- CRUD completo para filhos, atividades e prêmios.
- Controle de pontos para cada filho baseado nas atividades concluídas.
- Resgate de prêmios utilizando pontos acumulados.
- Visualização de atividades recentes e status de conclusão.
- Geração de tokens públicos para compartilhamento de prêmios e atividades.
- Interface frontend servida via Express a partir da pasta `public`.

## Tecnologias Utilizadas

- Node.js com Express para backend.
- MySQL para banco de dados.
- JWT para autenticação.
- CORS para controle de acesso.
- Frontend em HTML, CSS e JavaScript (arquivos estáticos na pasta `public`).

## Instalação

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd ProjetoGameficado
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente criando um arquivo `.env` na raiz do projeto com as seguintes variáveis:

   Para usar banco local:
   ```
   USE_LOCAL_DB=true
   LOCAL_DB_HOST=localhost
   LOCAL_DB_PORT=3306
   LOCAL_DB_USER=seu_usuario
   LOCAL_DB_PASSWORD=sua_senha
   LOCAL_DB_NAME=nome_do_banco
   ```

   Para usar banco remoto (exemplo Railway):
   ```
   USE_LOCAL_DB=false
   DB_HOST=host_remoto
   DB_PORT=porta_remota
   DB_USER=usuario_remoto
   DB_PASSWORD=senha_remota
   DB_NAME=nome_banco_remoto
   ```

4. Configure a chave secreta JWT no código (arquivo `backend/server.js`) na linha onde é usado `'your_jwt_secret_key'`. Recomenda-se usar uma variável de ambiente para isso em produção.

## Como Executar

Inicie o servidor backend com o comando:

```bash
npm start
```

O servidor estará rodando na porta 3000 por padrão.

A aplicação frontend está disponível na rota raiz (`/`) e é servida a partir da pasta `public`.

## Estrutura do Projeto

- `backend/` - Código do servidor Node.js e scripts SQL para banco de dados.
- `public/` - Arquivos estáticos do frontend (HTML, CSS, JS, imagens).
- `package.json` - Configurações do projeto e dependências.

## API (Resumo)

- `POST /login` - Login de usuário (responsável ou filho).
- `POST /cadastro-responsavel` - Cadastro de responsável.
- Rotas protegidas por JWT para gerenciar filhos, atividades e prêmios:
  - CRUD filhos: `/criar-filho`, `/filhos`, `/editar-filho/:id`, `/excluir-filho/:id`
  - CRUD atividades: `/atividades`, `/atividades/recentes`, `/atividades/:id/confirmar`
  - CRUD prêmios: `/api/premios`, `/api/premios/:id`
  - Resgate de prêmios: `/resgatar-premio`
- Rotas públicas para visualização via token:
  - `/api/premios-publicos/:token`
  - `/atividades-publicas/:token`

## Licença

Este projeto está licenciado sob a licença ISC.
