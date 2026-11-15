# Projeto para avaliação P2 da Disciplina de Desenvolvimento de aplicativos híbridos
# Turma 7º período - Engenharia de Software Univassouras - Campus Maricá
# Professor Marcio Alexandre Dias Garrido
# Alunos: Amanda Nick e Luana Zenha

# Holocron

Enciclopédia de Star Wars no celular. O catálogo público vem da Star Wars Databank. A pessoa cria decks por lado — Jedi, Sith, Aliança Rebelde, Império, República, Separatistas, Mandalorianos ou Caçadores de Recompensa — e cada carta só entra num deck do próprio lado. A conta e os decks ficam numa API deste repositório e continuam no aparelho quando a rede cai.

São dois programas. O `backend` é a API. O `mobile` é o aplicativo. Eles sobem em terminais separados. O celular só fala com a API. A API só fala com o arquivo SQLite dela. O aplicativo nunca abre o banco do servidor.

## O que precisa estar instalado

- Node.js 22 ou mais novo. A API usa `node:sqlite`, que só existe a partir dessa versão. Confira com `node --version`.
- npm, que vem com o Node. Confira com `npm --version`.
- Git, para clonar o repositório.
- Para o aparelho físico: o aplicativo Expo Go (Google Play ou App Store) e o computador na mesma rede Wi-Fi do celular.
- Para ver no navegador da própria máquina, o Expo Go não é necessário. O navegador serve para olhar a interface. O cofre de token do sistema só existe no celular.

## Como colocar para rodar

Abra dois terminais. O primeiro fica com a API. O segundo fica com o Expo. Os dois precisam continuar abertos enquanto você testa.

### 1. Clonar

```bash
git clone https://github.com/LuanaPZenha/HolocronProject.git
cd HolocronProject
```

### 2. Subir a API

No PowerShell:

```powershell
cd backend
copy .env.example .env
npm install
npm run dev
```

No prompt clássico do Windows, ou no bash:

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

O arquivo `.env` não vai para o Git. O exemplo que vem no repositório já deixa a API utilizável neste computador:

```text
PORT=3000
JWT_SECRET=troque-este-segredo-com-pelo-menos-32-caracteres
DATABASE_PATH=./data/holocron.db
```

`JWT_SECRET` assina o token de login. Troque o texto do exemplo por outra frase longa, com pelo menos 32 caracteres, antes de usar fora da sua máquina. Se a chave tiver menos de 32 caracteres, o servidor recusa a assinar.

`DATABASE_PATH` é o arquivo SQLite da API. O valor `./data/holocron.db` cria a pasta `backend/data` na primeira execução. Esse arquivo também fica fora do Git. Apagar `backend/data` zera usuários, decks e cartas. As tabelas são criadas de novo sozinhas na próxima subida. Uma base antiga ganha as colunas `deck` e `deck_id`, e a tabela `decks`, na primeira subida desta versão.

Quando der certo, o terminal mostra:

```text
Holocron API em http://0.0.0.0:3000
```

`0.0.0.0` significa que a API aceita conexão deste computador e de outro aparelho na mesma rede. A porta padrão é 3000. Se ela já estiver ocupada, mude `PORT` no `.env` e use a mesma porta no aplicativo.

Prova rápida, em outro terminal:

```powershell
curl http://127.0.0.1:3000/saude
```

A resposta esperada é `{"ok":true}`.

`npm run dev` recarrega o servidor quando um arquivo de `backend/src` muda. `npm start` sobe uma vez, sem ficar observando o código.

### 3. Descobrir o endereço que o celular enxerga

No celular, `localhost` e `127.0.0.1` apontam para o próprio celular, não para o computador. No Expo Go, se `EXPO_PUBLIC_API_URL` for `http://127.0.0.1:3000` ou `http://localhost:3000`, o app troca esse host pelo IP que o Metro já está usando (o mesmo do QR Code) e mantém a porta. No navegador, `127.0.0.1` continua apontando para a própria máquina, o que é o certo. Se o celular ainda não alcançar a API, o firewall do Windows pode estar bloqueando a porta 3000, ou o Metro não publicou um IP da rede local. Nesse caso, grave o IPv4 direto no `.env`.

No PowerShell:

```powershell
ipconfig
```

Use o `Endereço IPv4` do adaptador Wi-Fi, algo como `192.168.0.12`. O endereço da API para o celular fica `http://192.168.0.12:3000`.

| Onde o app está | Valor de `EXPO_PUBLIC_API_URL` |
| --- | --- |
| Navegador ou simulador iOS na mesma máquina | `http://127.0.0.1:3000` |
| Emulador Android | `http://10.0.2.2:3000` |
| Celular físico na mesma Wi-Fi | `http://IP_DA_MAQUINA:3000` |

Rede de escola e rede de visitante costumam bloquear aparelhos entre si. Se o celular não alcança a API, use o túnel do Expo só para o Metro. A API continua precisando de um IP que o celular alcance, ou de um túnel separado. O caminho simples é uma Wi-Fi doméstica, com os dois na mesma rede.

### 4. Subir o aplicativo

O Expo não fica na raiz `Holocron`. O `package.json` do app está em `mobile`. Por isso `npx expo start` digitado em `C:\Users\luana\Desktop\Holocron` responde que `package.json` não existe.

Na raiz, depois do `.env` do mobile configurado, o atalho é:

```powershell
npm start
```

Esse comando entra em `mobile` e sobe o Metro. A API continua no outro terminal (`npm run api` na raiz, ou `npm run dev` dentro de `backend`).

O caminho direto, equivalente:

```powershell
cd mobile
copy .env.example .env
npm install
npx expo start
```

O exemplo já vem com `http://127.0.0.1:3000`. No Expo Go, o app troca esse host pelo IP do Metro (o mesmo do QR Code) e mantém a porta 3000. Deixe assim, a menos que o celular não alcance a API. Aí grave o IPv4 direto:

```text
EXPO_PUBLIC_API_URL=http://192.168.0.12:3000
EXPO_PUBLIC_DATABANK_URL=https://starwars-databank-server.onrender.com/api/v1
```

Só variáveis que começam com `EXPO_PUBLIC_` entram no aplicativo. O segredo do JWT não fica aqui. Ele fica só no `.env` do backend.

Depois:

```powershell
npx expo start
```

O Metro mostra um QR Code.

- Android: abra o Expo Go e use o leitor de dentro do próprio Expo Go.
- iOS: a câmera do sistema abre o Expo Go.
- Neste computador, no navegador: tecle `w` no terminal do Metro, ou rode `npx expo start --web`.

Se o QR não conecta porque a rede bloqueia a porta do Metro, rode `npx expo start --tunnel`.

Mudou o `.env` do mobile? Pare o Metro com Ctrl+C e rode `npx expo start` de novo. O endereço da API é embutido na abertura do bundle.

### 5. Primeiro uso

1. Na primeira tela, crie uma conta. A senha precisa de 8 a 72 caracteres.
2. O login devolve um token. O app guarda esse token e abre a enciclopédia.
3. Em Meu Holocron, escolha um lado e crie um deck com nome. Criar ou apagar deck precisa da API no ar.
4. Abra uma ficha. O app lê o nome e a descrição e mostra só os decks daquele lado. Um toque em **Adicionar a [deck]** coloca a carta. Se ainda não houver deck daquele lado, o nome se cria na própria ficha.
5. A ficha mostra a descrição inteira da Databank. Quando o nome existe na SWAPI, entram também os dados dela: altura, planeta, filmes, clima, fabricante e o restante, com os nomes no lugar dos links. Organização não tem essa ficha extra.

Para encerrar, feche os dois terminais com Ctrl+C. Na próxima vez, não precisa instalar de novo: `npm run dev` no backend e `npx expo start` no mobile, desde que os `.env` continuem lá.

### Quando algo não abre

- `The expected package.json path: ...\Holocron\package.json does not exist` ao rodar `npx expo start` na raiz: entre em `mobile` (`cd mobile`) e rode de novo, ou use `npm start` na raiz.
- `node:sqlite` ou erro de módulo nativo: o Node é anterior ao 22. Instale o LTS atual e abra um terminal novo.
- `JWT_SECRET ausente ou curto demais`: o `.env` do backend não existe ou a chave tem menos de 32 caracteres.
- `{"ok":true}` não responde: o primeiro terminal não está na pasta `backend`, ou a porta 3000 está ocupada.
- O app diz que não alcança o Holocron: `EXPO_PUBLIC_API_URL` aponta para `localhost` no celular, o IP mudou, ou o firewall do Windows bloqueia a porta 3000. Libere a porta para a rede privada.
- Tela branca no Expo Go: feche o Expo Go, pare o Metro e rode `npx expo start` outra vez.
- A enciclopédia vazia com erro de rede: a Databank pública está lenta ou fora. O arquivo pessoal, se já tiver sido baixado, continua no aparelho.

## Arquitetura

O sistema tem a API e o aplicativo deste repositório, mais duas fontes públicas só de leitura: a Databank e a SWAPI.

```text
celular ou navegador                         computador
┌─────────────────────────┐                 ┌──────────────────────────┐
│  Apresentação           │                 │  Express                 │
│  telas, listas, tema    │   HTTP JSON     │  /auth, /arquivos, /decks│
│                         │ ──────────────► │                          │
│  Estado                 │   Bearer JWT    │  bcrypt + JWT HS256      │
│  sessão, cartas, decks  │                 │                          │
│                         │                 │  SQLite do servidor      │
│  Dados locais           │                 │  usuarios, decks, cartas │
│  SQLite, cache, cofre   │                 └──────────────────────────┘
└───────────┬─────────────┘
            │ HTTPS, sem token
            ▼
   Star Wars Databank          SWAPI (swapi.py4e.com)
   nome, descrição, imagem     ficha técnica, se o nome coincidir
```

### Apresentação

Fica em `mobile/app` e `mobile/components`. Cada arquivo dentro de `mobile/app` vira uma rota. Os grupos `(auth)` e `(app)` organizam login e área logada sem aparecer no endereço. As abas são Enciclopédia e Meu Holocron. A ficha é uma rota dinâmica `entrada/[categoria]/[id]`. Meu Holocron lista os decks por lado. A ficha só oferece decks do mesmo lado da carta.

O visual está em `mobile/constants/theme.ts`: fundo preto no escuro, cinza-frio no claro, tinta azul, verde ou vermelho. `DESIGN.md` registra a paleta e as fontes (Audiowide no nome HOLOCRON, Rajdhani na interface, Share Tech Mono nos números).

### Estado

Dois contextos, e só esses dois, guardam o que várias telas precisam ao mesmo tempo.

- `AuthContext` guarda a pessoa logada e as claims do token (algoritmo, `userId`, expiração). A senha não fica no estado. O token bruto não é mostrado na tela.
- `HolocronContext` guarda as cartas arquivadas, os decks da conta e os conflitos entre o aparelho e o servidor.

Texto de busca e o nome de um deck ainda não criado ficam no estado da própria tela.

A splash só some depois que as fontes carregam e a sessão termina de ser lida do armazenamento. Sem isso, o app piscaria a tela de login e em seguida pularia para dentro.

### Dados

| Módulo | Função |
| --- | --- |
| `mobile/services/starWarsApi.ts` e `databank.ts` | Catálogo público e ficha da SWAPI. Não enviam token. |
| `mobile/services/backendApi.ts` | API própria. Coloca `Authorization: Bearer` em tudo, menos em `/auth/`. Se a API responde 401 com token, encerra a sessão. |
| `mobile/services/cache.ts` | Cache de 30 minutos da Databank. Se a rede falha e existe cache velho, mostra o cache. |
| `mobile/services/database.ts` | SQLite do aparelho e fila do que ainda não subiu. |
| `mobile/services/seguro.ts` | Token no Secure Store do celular. |
| `mobile/services/storage.ts` | Preferências em texto, no AsyncStorage. |

Fora do laboratório, `EXPO_PUBLIC_API_URL` precisa ser `https://`. Em desenvolvimento, `http://` só é aceito para localhost e para IP de rede privada.

### O que cada pasta faz

```text
backend/src/server.ts                  Express, CORS, JSON e rotas
backend/src/database/conexao.ts        arquivo SQLite e criação das tabelas
backend/src/utils/jwt.ts               assina e verifica o token
backend/src/utils/validar.ts           limites de e-mail, senha, lado e nota
backend/src/utils/lado.ts              lê o lado da carta pelo nome e pela descrição
backend/src/middlewares/authMiddleware.ts  lê o Bearer e preenche userId
backend/src/controllers                  cadastro, login e CRUD do arquivo
mobile/app                               rotas
mobile/components                        peças de tela
mobile/contexts                          sessão e arquivo pessoal
mobile/services                          HTTP, banco local, cache e cofre
mobile/hooks                             tema, rede, largura e lista
```

## Banco de dados

Existem dois SQLite. Eles não são o mesmo arquivo e não se copiam disco a disco. O que viaja entre eles é JSON, pelas rotas `/arquivos` e `/decks`.

Não há ORM. Não existe Prisma, TypeORM, Sequelize, Drizzle nem um modelo que vire SQL sozinho. Cada consulta é uma string SQL escrita no código, com `?` no lugar dos valores.

Na API, `backend/src/database/conexao.ts` abre o arquivo com `DatabaseSync` de `node:sqlite`. Os controllers chamam `obterBanco().prepare(...).run()`, `.get()` ou `.all()`. `prepare` compila a sentença. `run` grava. `get` devolve uma linha. `all` devolve a lista. O objeto TypeScript `ArquivoRegistro` só descreve a linha depois que o SQLite responde. Ele não cria tabela nem traduz a consulta.

No aparelho, `mobile/services/database.ts` usa `expo-sqlite`: `execAsync` para criar as tabelas e `runAsync` / `getAllAsync` para o resto. No navegador, `database.web.ts` guarda o mesmo formato no AsyncStorage, porque o SQLite nativo não entra no bundle web. O contrato continua sendo SQL no celular e JSON na API.

O `backend/docker-compose.yml` sobe um PostgreSQL 17 se alguém quiser um banco separado no futuro. A API que este repositório executa não conecta nesse Postgres. Subir o projeto não depende de Docker.

### SQLite do servidor

Arquivo padrão: `backend/data/holocron.db`, definido por `DATABASE_PATH`. A conexão usa `node:sqlite`, com `journal_mode = WAL` e `foreign_keys = ON`. As tabelas nascem no `CREATE TABLE IF NOT EXISTS` quando o servidor sobe. Não há script de migração separado.

Tabela `usuarios`:

| Coluna | Papel |
| --- | --- |
| `id` | UUID, chave primária |
| `nome` | Nome mostrado no app |
| `email` | Único, guardado em minúsculas |
| `senha_hash` | Hash bcrypt. A senha em claro não é gravada |
| `criado_em` | Data em ISO |

Tabela `decks`, um baralho nomeado dentro de um lado:

| Coluna | Papel |
| --- | --- |
| `id` | UUID, chave primária |
| `user_id` | Dono. Chave estrangeira para `usuarios.id`, com `ON DELETE CASCADE` |
| `nome` | Nome dado pela pessoa, até 40 caracteres |
| `faccao` | `jedi`, `sith`, `rebeldes`, `imperio`, `republica`, `separatistas`, `mandalorianos` ou `cacadores` |
| `criado_em` | Data em ISO |

Tabela `arquivos`, uma carta por pessoa e por ficha da Databank:

| Coluna | Papel |
| --- | --- |
| `id` | UUID interno, não vai na resposta |
| `user_id` | Dono. Chave estrangeira para `usuarios.id`, com `ON DELETE CASCADE` |
| `item_id` | Identificador da ficha na Databank |
| `categoria` | `characters`, `locations`, `vehicles`, `droids`, `species`, `creatures` ou `organizations` |
| `nome`, `imagem_url`, `descricao` | Cópia da ficha no momento em que foi guardada. A descrição não é cortada |
| `deck` | Lado da carta: um dos slugs de `faccao`, ou `avulso` quando a carta não está num deck nomeado |
| `deck_id` | Deck da pessoa, ou vazio. Precisa ser um deck do mesmo lado que o texto da carta |
| `status` | `Para Explorar`, `Estudando`, `Dominado` ou `Favorito`. A coluna permanece; as telas atuais não pedem esse passo |
| `progresso` | Inteiro de 0 a 100. A coluna permanece; o medidor saiu das telas |
| `nota` | Inteiro de 0 a 10 |
| `anotacao` | Texto, até 4000 caracteres |
| `updated_at` | Data ISO da última gravação |

O par `(user_id, item_id)` é único. A mesma pessoa não guarda a mesma ficha duas vezes. Outra conta pode guardar a mesma ficha, porque o `item_id` sozinho não é único. A listagem filtra `WHERE user_id = ?`. Uma conta não lê nem apaga o arquivo de outra.

As consultas usam `?` no lugar de concatenar texto. O índice `idx_arquivos_usuario` cobre a lista de uma pessoa ordenada por `updated_at`. O índice `idx_decks_usuario` cobre os decks da conta.

Ao criar ou mover uma carta com `deck_id`, o servidor lê o nome e a descrição e calcula o lado. Jedi e Sith pesam mais do que Império e Aliança quando o texto cita os dois. Se o lado não bater com a `faccao` do deck, a resposta é 400. Carta sem lado reconhecido também recebe 400. Apagar um deck que ainda tem carta responde 409.

A resposta pública do arquivo não inclui `id` nem `user_id`. A resposta pública do usuário não inclui `senha_hash`.

### SQLite do aparelho

No celular o arquivo se chama `holocron.db` e fica no sandbox do app, aberto por `expo-sqlite`. No navegador, o mesmo formato é espelhado no AsyncStorage, porque o SQLite nativo não sobe no bundle web.

Tabela `arquivos`: as mesmas colunas da carta na API, com `item_id` como chave primária. Não há `user_id` aqui. O banco do aparelho é da sessão atual. Ao sair da conta, as tabelas locais são esvaziadas.

Tabela `decks`: `id`, `nome` e `faccao`. É a cópia local dos decks da conta. Criar e apagar deck exige rede, porque o `id` nasce no servidor. Uma carta pode entrar na fila offline se o deck já existir.

Tabela `sync_queue`, o que ainda não chegou ao servidor:

| Coluna | Papel |
| --- | --- |
| `id` | Ordem da fila |
| `operacao` | `criar`, `atualizar` ou `remover` |
| `item_id` | Ficha afetada |
| `payload_json` | Corpo que será enviado |
| `timestamp` | Momento em que entrou na fila |

A fila sai na ordem do `id`. Um `409` em criação, um `404` em remoção ou um `400` descarta aquele item. Falha de rede ou erro 5xx interrompe e tenta de novo quando a conexão volta. Enquanto a fila não esvazia, o app não substitui a cópia local pela lista do servidor, para não apagar uma edição que ainda não subiu.

Se os dois lados já têm a carta e o lado, o deck, o status, a nota ou a anotação divergem, o item vira conflito. A política padrão é perguntar na tela Conflitos: ficar com o aparelho, ficar com o servidor, ficar com a escrita de `updated_at` mais recente, ou mesclar. A mescla fica com o deck da escrita mais recente quando os dois discordam. Dá para trocar a política para a próxima sincronização decidir sozinha.

### O que não é tabela

| Lugar | O que guarda | Por que não é o SQLite |
| --- | --- | --- |
| Secure Store, chave `holocron.v2.jwt_token` | Token JWT | Texto curto cifrado pelo Keychain no iOS e pelo Keystore no Android. No navegador, onde não há cofre, a sessão de teste usa `sessionStorage` e acaba quando a aba fecha |
| AsyncStorage, prefixo `holocron:v2:` | Tema, categoria, buscas, perfil sem segredo, conflitos pendentes, rascunho | Preferência e cache leve, em texto |

O token antigo `holocron_jwt_token` e as chaves sem versão são lidos uma vez e copiados para a chave nova.

## Autenticação

1. `POST /auth/register` ou `POST /auth/login` recebe e-mail e senha. O cadastro também recebe o nome.
2. A senha é conferida com bcrypt. O servidor devolve `{ user, token }`.
3. O token é JWT HS256, válido por 7 dias. O payload leva `userId` e a expiração. Não leva senha, e-mail nem segredo.
4. Nas rotas de carta e de deck, o header é `Authorization: Bearer <token>`.
5. O middleware verifica a assinatura com `JWT_SECRET` e usa o `userId` em toda consulta.

Cadastro duplicado responde 409. Senha errada responde 401. Rota sem token, ou com token inválido, responde 401.

## Rotas da API

| Método | Caminho | Auth | Resultado |
| --- | --- | --- | --- |
| GET | `/saude` | não | `200 { ok: true }` |
| POST | `/auth/register` | não | `201 { user, token }` |
| POST | `/auth/login` | não | `200 { user, token }` |
| GET | `/arquivos` | Bearer | `200` lista só daquela conta |
| POST | `/arquivos` | Bearer | `201`, ou `409` se a ficha já existe |
| PUT | `/arquivos/:itemId` | Bearer | `200` atualiza a carta, inclusive `deck` e `deck_id` |
| DELETE | `/arquivos/:itemId` | Bearer | `200`, ou `404` se não for dessa conta |
| GET | `/decks` | Bearer | `200` lista os decks da conta |
| POST | `/decks` | Bearer | `201 { id, nome, faccao, criado_em }` |
| DELETE | `/decks/:id` | Bearer | `200`, `404` se não for dessa conta, ou `409` se ainda houver carta |

Corpo para criar um arquivo:

```json
{
  "item_id": "abc",
  "categoria": "characters",
  "nome": "Luke Skywalker",
  "imagem_url": "https://exemplo.com/luke.jpg",
  "descricao": "Jedi.",
  "deck_id": "uuid-do-deck-jedi",
  "status": "Para Explorar",
  "progresso": 0,
  "nota": 0,
  "anotacao": ""
}
```

`deck_id` é opcional para uma carta antiga. Quando ele vem preenchido, o servidor ignora um `deck` mentido e grava o lado do texto, se esse lado for o do deck.

Corpo para criar um deck:

```json
{
  "nome": "Conselho de Yavin",
  "faccao": "jedi"
}
```

Exemplo no PowerShell, depois da API no ar:

```powershell
curl http://127.0.0.1:3000/auth/register `
  -H "Content-Type: application/json" `
  -d "{\"nome\":\"Leia\",\"email\":\"leia@exemplo.com\",\"senha\":\"senha-forte\"}"
```

Use o `token` da resposta:

```powershell
curl http://127.0.0.1:3000/arquivos -H "Authorization: Bearer SEU_TOKEN"
```

## Testes

Na pasta `backend`:

```powershell
npm test
```

Confere se o JWT assina, se o payload não carrega senha e se um token adulterado é recusado.

Na pasta `mobile`:

```powershell
npm test
```

Cobre a leitura das claims, a escolha entre escrita local e remota, o lado e o deck no conflito, a regra de HTTPS e os estados de tela vazia e de erro.

`npm run auditoria`, em cada pasta, executa `npm audit`.
