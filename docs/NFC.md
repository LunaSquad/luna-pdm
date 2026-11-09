# Entrar na turma pela tag NFC — passo a passo

## O que a tag precisa conter

Um registro NDEF do tipo **Texto** com o link:

```
appluna://turma/<idTurma>
```

`<idTurma>` é o **`_id` da turma no MongoDB** (24 caracteres). Exemplo, usando a turma criada pelo `seed.js` ("4 Ano H"):

```
appluna://turma/6aea297b7e5984a2a167be19
```

Só o id (`6aea297b7e5984a2a167be19`) também funciona, mas o link é melhor porque o app consegue
rejeitar tags que não são da Luna.

### Como descobrir o id da turma
- Rodando o seed na API (`npm run seed`): ele imprime `Link para gravar no NFC: appluna://turma/...`.
- Ou no MongoDB Atlas: banco `Atividade_PDM` → coleção `turmas` → copie o `_id` do documento.

## 1) API
1. Suba a versão da API que tem as rotas `GET /alunos/:id/turma` e `POST /alunos/:id/turma/vincular`
   (está em `api-luna-pdm-main`). Se usa o Render, faça o deploy dessa versão.
2. Confira: `https://api-luna-pdm.onrender.com/` deve responder `{"status":"API Luna PDM online!"}`.
   (No plano gratuito a primeira chamada pode levar ~1 min para "acordar".)

## 2) App
```bash
npm install
npx expo install react-native-nfc-manager expo-dev-client
```
Confirme o `.env`:
```
EXPO_PUBLIC_API_URL=https://api-luna-pdm.onrender.com
```
(use **https**; com `http://` o Render redireciona e o POST pode falhar.)

## 3) Development build (obrigatório para NFC)
O NFC usa código nativo, então **não funciona no Expo Go**. Escolha um caminho:

**A) Local (Android Studio + celular com depuração USB):**
```bash
npx expo run:android
npx expo start --dev-client
```

**B) Na nuvem (EAS), sem Android Studio:**
```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile development --platform android
```
Instale o APK gerado no celular e rode `npx expo start --dev-client`.

Você só refaz o build se instalar outra biblioteca nativa. Mudanças nas telas atualizam na hora.

## 4) Gravar a tag
1. Instale o app **NFC Tools** (Android).
2. **Gravar → Adicionar um registro → Texto**.
3. Digite `appluna://turma/<idTurma>` → **OK → Gravar** → encoste a tag.
4. Use tags NTAG213/215/216 (baratas e compatíveis).

> Use o registro **Texto**. Se gravar como "URL/URI personalizada" o app também lê, mas com o app fechado o
> Android pode tentar abrir o link e cair numa rota inexistente.

## 5) Testar
1. Faça login com um aluno **sem turma** (cadastre um novo pelo app) → aba **Turma**.
2. Toque em **Ler tag NFC** e encoste a tag na parte de trás do celular.
3. A tela passa a mostrar a turma, o professor e as matérias; a Home também atualiza.

Sem tag? Na mesma tela use **Entrar com código** e cole `appluna://turma/<idTurma>`.
Isso chama exatamente a mesma função e serve para testar no emulador.

Testando só a API:
```bash
curl -X POST https://api-luna-pdm.onrender.com/alunos/<idAluno>/turma/vincular \
  -H "Content-Type: application/json" -d '{"turmaId":"6aea297b7e5984a2a167be19"}'
```

## Problemas comuns
| Sintoma | Causa / solução |
|---|---|
| "O NFC não está disponível nesta versão do app" | Está no Expo Go. Use o development build. |
| "O NFC está desligado" | Ligue em Configurações → NFC (o app oferece abrir as configurações). |
| "Essa tag não é um convite de turma válido" | O conteúdo não é `appluna://turma/<24 caracteres>`. Regrave a tag. |
| "Turma não encontrada" | O id não existe no banco. Confira o `_id` em `turmas`. |
| "O servidor demorou para responder" | Render dormindo; tente de novo em alguns segundos. |
| Erro de rede só no Android | A URL do `.env` está com `http://`. Use `https://`. |

iPhone: ler NFC exige conta Apple Developer paga (entitlement). Para a atividade, use Android.
