# Luna PDM — app do aluno

Repositório destinado a ATV 2 da matéria de PDM

App móvel (React Native + Expo Router) do Projeto Integrador **Luna**, consumindo a API REST `api-luna-pdm`.
Atividade Avaliativa II — Programação para Dispositivos Móveis I.

## Como rodar
```bash
npm install
cp .env.example .env                                        # EXPO_PUBLIC_API_URL=https://...
npx expo run:android          # gera o development build (NFC não roda no Expo Go)
npx expo start --dev-client
```

### Rodando no Expo Go (sem NFC)
Para testar as telas e a API sem gerar o development build, use o Expo Go.
**Atenção:** a leitura de tag NFC não funciona nesse modo. Use a alternativa **Entrar com código**.

```bash
npx expo start --go
```

Ou, com o servidor já rodando (`npx expo start`), aperte **`s`** no terminal para alternar entre development build e Expo Go. O QR code muda para `exp://<ip>:8081`; escaneie de novo pelo Expo Go.

Entrar na turma pela tag NFC: **[docs/NFC.md](docs/NFC.md)** (link da tag: `appluna://turma/<idTurma>`).

## Estrutura de pastas (seguindo as aulas)
```
src/
├── app/                    Aula 08 – Expo Router: SÓ rotas/telas
│   ├── _layout.tsx           layout raiz (Stack + UserProvider)
│   ├── index.tsx             redireciona para /login
│   ├── login.tsx
│   ├── cadastro.tsx
│   └── (tabs)/               navegação em abas
│       ├── _layout.tsx
│       ├── home.tsx
│       ├── turma.tsx         ← funcionalidade: entrar na turma por NFC
│       └── userProfile.tsx
├── components/             Aula 09 – componentes reutilizáveis com Props
│   ├── common/               botão, input, mensagem de estado (erro/vazio)
│   ├── home/                 cards de matéria
│   ├── turma/                header da turma, professor, matéria, card NFC, "sem turma"
│   ├── perfil/               campos e ações do perfil
│   └── cadastro/             campos e passos do cadastro
├── services/               Aulas 13 e 14 – tudo que fala com a API/dispositivo
│   ├── api.ts                URL base + fetch com timeout e erros amigáveis
│   ├── authService.ts        POST /auth/login
│   ├── alunoService.ts       GET  /alunos/:id
│   ├── turmaService.ts       GET  /alunos/:id/turma · POST /alunos/:id/turma/vincular
│   └── nfcService.ts         Aula 15 – recurso nativo (leitura da tag)
├── context/                UserContext (userId do aluno logado)
├── styles/                 theme.ts, cores.ts, home.styles.ts (Aula 04 – StyleSheet/Flexbox)
└── utils/                  aviso.ts, máscaras do cadastro
```
Regra da aula 08: dentro de `app/` ficam apenas telas (arquivos auxiliares ali viram rotas por engano).

## Atividade II — onde está cada requisito
| Requisito | Onde |
|---|---|
| Interface / StyleSheet / Flexbox | `components/**`, `app/(tabs)/turma.tsx` (`StyleSheet.create`) |
| Expo Router | `src/app/**` (Stack + Tabs, `useLocalSearchParams`, `router.push`) |
| Consumo de API (fetch) | `services/api.ts` → `turmaService.ts`, `alunoService.ts`, `authService.ts` |
| FlatList / SectionList | `turma.tsx` (FlatList de matérias) · `home.tsx` (SectionList) |
| useState / useEffect | `turma.tsx` (`useState`, `useEffect` do card NFC, `useFocusEffect`) |
| Componentes com Props | `NfcConviteCard`, `SemTurma`, `CodigoTurmaForm`, `MateriaItem`… |
| Carregamento e erros | `turma.tsx`: `ActivityIndicator`, `EstadoMensagem` + "Tentar novamente", `RefreshControl` |
| Recurso nativo | `services/nfcService.ts` (NFC) |

### Funcionalidade individual (para o vídeo)
**Entrar na turma lendo a tag NFC** + **tela "sem turma"**:
1. `turma.tsx` carrega `GET /alunos/:id/turma`. Se `emTurma = false`, mostra `SemTurma`.
2. Botão **Ler tag NFC** → `lerTagNfc()` (nfcService) devolve o texto da tag.
3. `extrairConvite()` valida `appluna://turma/<id>` e extrai o `turmaId`.
4. `vincularTurma()` faz `POST /alunos/:id/turma/vincular` e a tela já exibe a turma devolvida.
5. Alternativa sem NFC: campo **Entrar com código** (mesma função).
