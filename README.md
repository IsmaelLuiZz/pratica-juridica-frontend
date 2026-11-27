# Sistema de Gestão da Prática Jurídica

Frontend do MVP da **UNINASSAU · João Pessoa** para registrar atendimentos, acompanhar casos jurídicos e organizar a supervisão acadêmica. A interface consome uma API FastAPI com PostgreSQL.

## Funcionalidades

| Módulo | O que está disponível |
| --- | --- |
| Autenticação | Login com JWT, sessão por aba e navegação por perfil |
| Dashboard | Casos ativos e encerrados, atendimentos no período, atividades pendentes e prazos próximos |
| Assistidos | Cadastro, busca por nome ou CPF, filtros e histórico de atendimentos e casos |
| Atendimentos | Consulta por assistido e período, registro em caso existente ou abertura de um novo caso no mesmo fluxo |
| Casos jurídicos | Abertura com partes e responsáveis, consulta, atividades, prazos, documentos e histórico cronológico |
| Supervisão | Aprovação ou solicitação de ajustes em documentos pelo professor orientador |

O perfil **Aluno/Estagiário** movimenta os casos em que está vinculado. O **Professor/Orientador** tem acesso ao dashboard e à revisão de documentos dos casos que orienta. **Gestão/Coordenação** tem acesso ao dashboard e à gestão operacional. Coordenador e gestor usam o mesmo perfil `ADMIN` na API.

## Executar localmente

**Pré-requisitos** · Node.js `^20.19.0 || >=22.12.0`, npm, backend disponível na porta `8000` e PostgreSQL. Se estiver usando o Docker Compose do backend, inicie o Docker Desktop antes dos comandos.

Mantenha `pratica-juridica-frontend` e `pratica-juridica-backend` como pastas irmãs.

### 1. Banco e API

No terminal do backend, considerando o ambiente virtual Python já criado e as dependências de `requirements.txt` instaladas, execute:

~~~powershell
docker compose up -d postgres
docker compose exec postgres pg_isready
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
~~~

Ao executar o FastAPI no Windows, a conexão com o PostgreSQL do Compose usa `127.0.0.1:5433`. A porta `5432` é interna ao contêiner. Se o `.env` do backend definir `DATABASE_URL`, ajuste a porta nessa URL, pois ela tem precedência sobre `DB_PORT`.

Mantenha o FastAPI em execução e confira a resposta de [saúde da API](http://127.0.0.1:8000/) ou a lista de rotas no [Swagger](http://127.0.0.1:8000/docs).

### 2. Frontend

Na raiz do frontend, instale as dependências usando o lockfile:

~~~powershell
npm ci
~~~

Crie o arquivo `.env.local` na raiz com este valor:

~~~dotenv
VITE_API_URL=/api
~~~

Inicie o Vite:

~~~powershell
npm run dev
~~~

Abra [http://localhost:5173/login](http://localhost:5173/login) e entre com uma conta cadastrada no backend. Selecione na tela o perfil associado à conta. O terminal do Vite informa o endereço efetivo se a porta padrão estiver ocupada.

### Configuração da API

O cliente Axios lê `VITE_API_URL` ao iniciar e usa `http://localhost:8000` por padrão. No desenvolvimento, o Vite encaminha `/api` para `http://127.0.0.1:8000` e remove o prefixo antes de enviar a requisição. Reinicie o Vite após alterar o arquivo de ambiente.

Em uma publicação, defina `VITE_API_URL` antes do build. Se usar `/api`, configure o servidor publicado para encaminhar esse prefixo à API. Se usar uma URL em outra origem, configure o CORS no backend. O host do frontend também deve devolver `index.html` para rotas da aplicação, como `/casos/123`.

## Organização do código

| Caminho | Responsabilidade |
| --- | --- |
| `src/App.tsx` | Rotas públicas e autenticadas |
| `src/contexts/` | Sessão e perfil do usuário |
| `src/services/` | Cliente Axios, autenticação e chamadas por domínio |
| `src/types/` | Tipos dos contratos da API |
| `src/components/` | Navegação, proteção de rotas, formulários, tabelas e modais |
| `src/pages/` | Telas do sistema |
| `src/index.css` | Tailwind CSS e estilos institucionais |

A stack usa React, TypeScript, Vite, React Router DOM, Axios, Lucide React e Tailwind CSS. O cliente HTTP envia o token como `Authorization: Bearer <token>`. Uma resposta `401` em rota autenticada encerra a sessão e redireciona para o login.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Iniciar o Vite em desenvolvimento |
| `npm run lint` | Executar o ESLint |
| `npm run build` | Validar TypeScript e gerar a versão de produção em `dist/` |
| `npm run preview` | Conferir localmente o build gerado |

## Diagnóstico local

- **Erro 502**. Confira se o FastAPI está em execução na porta 8000 e se o proxy do Vite consegue acessá-lo.
- **Erro 500 após o login**. Consulte o log do FastAPI. Em bancos criados com o schema anterior, verifique a migração `migrations/001_alinhar_schema_mvp.sql` no backend.
- **Falha de conexão**. Confira o endereço do Vite e o valor de `VITE_API_URL`. Reinicie o Vite depois de alterar o ambiente.

## Limites do MVP

O cadastro de documentos aceita links. Upload binário, edição de assistidos, encerramento de casos e revisão de atividades dependem de operações adicionais na API. A classificação das partes fica na descrição do caso, e o histórico usa as datas dos registros disponíveis.
