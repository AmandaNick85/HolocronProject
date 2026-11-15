# Holocron

Enciclopédia interativa de Star Wars. O celular consulta a história na Star Wars Databank e guarda um arquivo pessoal de estudo — status, progresso, nota e anotação — mesmo sem rede.

A interface segue o datapad da referência: fundo preto no escuro, cinza-frio no claro, wordmark `HOLOCRON`, medidor de domínio e moldura dupla. A tinta da leitura é azul, verde ou vermelho, escolhida no próprio app.

## Arquitetura

```text
holocron/
├── backend/     API REST (Express, TypeScript, JWT, SQLite)
└── mobile/      App (Expo Router, TypeScript, offline-first)
```

- **Apresentação:** `mobile/app` e `mobile/components`
- **Estado:** `AuthContext` (sessão) e `HolocronContext` (arquivo pessoal)
- **Dados:** Axios público para a Databank, Axios privado com JWT no Secure Store, cache com TTL de 30 minutos, SQLite local e fila de sincronização

O host da Databank usado por padrão é `https://starwars-databank-server.onrender.com/api/v1`. O host `starwars-databank-server.vercel.app` citado em alguns roteiros responde 404 em `/characters`. Dá para trocar com `EXPO_PUBLIC_DATABANK_URL`.

A API local grava em SQLite (`node:sqlite`) para subir no Windows sem Docker. `backend/docker-compose.yml` sobe PostgreSQL 17 como opção, sem ser o caminho que o servidor usa hoje.

## Requisitos

- Node.js 22 ou mais recente (`node:sqlite`)
- npm
- Expo Go no celular, na mesma rede Wi-Fi da máquina, para o aparelho físico

## Backend

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

No PowerShell, `copy .env.example .env`. O servidor escuta em `0.0.0.0:3000`.

`JWT_SECRET` precisa ter pelo menos 32 caracteres. Não commite o `.env`.

### Rotas

| Método | Caminho | Auth | Resposta |
| --- | --- | --- | --- |
| GET | `/saude` | não | `200 { ok: true }` |
| POST | `/auth/register` | não | `201 { user, token }` |
| POST | `/auth/login` | não | `200 { user, token }` |
| GET | `/arquivos` | Bearer | `200` lista do usuário |
| POST | `/arquivos` | Bearer | `201` ou `409` se duplicado |
| PUT | `/arquivos/:itemId` | Bearer | `200` |
| DELETE | `/arquivos/:itemId` | Bearer | `200` ou `404` |

Status de estudo: `Para Explorar`, `Estudando`, `Dominado`, `Favorito`. Progresso de 0 a 100. Nota de 0 a 10.

### Exemplos

```bash
curl -s http://127.0.0.1:3000/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"nome\":\"Leia\",\"email\":\"leia@exemplo.com\",\"senha\":\"senha-forte\"}"

curl -s http://127.0.0.1:3000/arquivos ^
  -H "Authorization: Bearer SEU_TOKEN"

curl -s -X POST http://127.0.0.1:3000/arquivos ^
  -H "Authorization: Bearer SEU_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"item_id\":\"abc\",\"categoria\":\"characters\",\"nome\":\"Luke Skywalker\",\"imagem_url\":\"https://exemplo.com/luke.jpg\",\"descricao\":\"Jedi.\"}"
```

O token carrega só `userId` e a expiração. A senha fica como hash bcrypt.

## Mobile

```bash
cd mobile
copy .env.example .env
npm install
npx expo start
```

No `.env`, `EXPO_PUBLIC_API_URL` tem de ser um endereço que o **celular** alcança.

- Simulador na mesma máquina: `http://127.0.0.1:3000` (Android Emulator costuma usar `http://10.0.2.2:3000`)
- Celular físico com Expo Go: o IP da máquina na Wi-Fi, por exemplo `http://192.168.0.12:3000`. `localhost` no telefone aponta para o próprio telefone, não para o computador

Depois de mudar o `.env`, reinicie o Expo.

No app: crie a conta, escolha a tinta (azul, verde ou vermelho), percorra uma categoria, abra uma ficha e guarde no Holocron. O medidor sobe 25 pontos em **Anotações e progresso**. Sem rede, a alteração fica na fila e sobe quando a conexão volta. O aviso na tela é: "Modo Offline — alterações no Holocron serão sincronizadas".

O login (`POST /auth/login`) devolve `{ user, token }`. O token HS256 fica no Secure Store (`holocron.v2.jwt_token`) e segue em `Authorization: Bearer`. A tela **Sessão JWT**, no menu lateral, mostra algoritmo, `userId` e expiração, sem o token. No navegador, onde não há cofre do sistema, a sessão usa `sessionStorage` só para conseguir testar a interface.

Fora do laboratório a URL da API precisa ser `https://`. No celular de desenvolvimento, `http://` só vale para localhost e IPs privados.

O menu lateral abre pela marca HOLOCRON. Lá estão a enciclopédia (`dismissAll`), a sessão, os conflitos, os princípios da interface, a exportação do arquivo e a saída. A exportação grava `holocron-arquivo.json` no disco do aparelho (no navegador, baixa o arquivo). A capa da ficha guardada também é baixada para o cache do aparelho.

Se o estudo local e o do servidor divergirem, a tela **Conflitos** deixa escolher o aparelho, o servidor, a última escrita ou a mescla. A política escolhida vale para a próxima sincronização. A anotação do modal grava um rascunho local 500 ms depois da digitação.

Chaves de preferência usam o prefixo `holocron:v2:`. O build Android de produção liga o R8/Proguard. `npm test` roda Jest e Testing Library no app, e o JWT no backend. `npm run auditoria` executa `npm audit`.

## O que cada pasta faz

- `backend/src/server.ts` sobe Express, CORS, JSON e as rotas
- `backend/src/middlewares/authMiddleware.ts` exige `Authorization: Bearer`
- `mobile/services/starWarsApi.ts` não envia token
- `mobile/services/backendApi.ts` injeta o JWT e encerra a sessão em `401`
- `mobile/services/cache.ts` devolve cache válido, atualiza se expirou e, sem rede, usa o cache vencido
- `mobile/services/database.ts` guarda o arquivo e a `sync_queue` com consultas parametrizadas
