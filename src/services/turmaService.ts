import { BASE_URL } from "./api";

/* ------------------------------------------------------------------ */
/* Tipos                                                              */
/* ------------------------------------------------------------------ */

export type Professor = {
  id: string;
  nome: string;
  urlFoto?: string;
};

export type Materia = {
  id: string;
  nome: string;
};

export type Turma = {
  id: string;
  nome: string;
  escola: string;
  anoLetivo?: string;
  periodo?: string;
};

export type TurmaCompleta = {
  turma: Turma;
  professor?: Professor;
  materias: Materia[];
};

export type Convite = {
  turmaId: string;
  codigo: string;
};

/* ------------------------------------------------------------------ */
/* Requisição base (fetch + timeout + tratamento de erro)             */
/* ------------------------------------------------------------------ */

async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const resposta = await fetch(`${BASE_URL}${caminho}`, {
      ...opcoes,
      headers: { "Content-Type": "application/json", ...opcoes.headers },
      signal: controller.signal,
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok || dados.ok === false) {
      throw new Error(dados.message ?? "Não foi possível completar a requisição.");
    }
    return dados as T;
  } catch (erro: any) {
    if (erro.name === "AbortError") {
      throw new Error("O servidor demorou para responder. Tente de novo.");
    }
    if (erro instanceof TypeError) {
      throw new Error("Sem conexão com o servidor. Verifique sua internet.");
    }
    throw erro;
  } finally {
    clearTimeout(timeout);
  }
}

/* ------------------------------------------------------------------ */
/* Endpoints                                                          */
/* ------------------------------------------------------------------ */

type AlunoApi = {
  turmaID?: string;
  turmaId?: string;
  idTurma?: string;
  codTurma?: string;
};

// ⚠️ Formato assumido — ajuste aqui se a API devolver nomes diferentes.
type TurmaApi = {
  turma: Partial<Turma> & { _id?: string; turmaID?: string; professor?: ProfessorApi };
  professor?: ProfessorApi;
};

type ProfessorApi = Partial<Professor> & { _id?: string; professorID?: string };

type MateriaApi = { id?: string; _id?: string; materiaID?: string; nome: string };

/**
 * Busca tudo que a tela precisa:
 * 1) GET /students/aluno/:userId  -> descobre o id da turma (mesmo endpoint da Home)
 * 2) GET /classes/turma/:turmaId  -> ⚠️ rota assumida, confirmar com o backend
 * 3) GET /subjects/materias       -> mesmo endpoint da Home
 * Retorna null quando o aluno ainda não está em nenhuma turma.
 */
export async function buscarTurmaDoAluno(userId: string): Promise<TurmaCompleta | null> {
  const { aluno } = await requisitar<{ aluno?: AlunoApi }>(`/students/aluno/${userId}`);
  const turmaId = aluno?.turmaID ?? aluno?.turmaId ?? aluno?.idTurma ?? aluno?.codTurma;

  if (!turmaId) return null;

  const [dados, resMaterias] = await Promise.all([
    requisitar<TurmaApi>(`/classes/turma/${turmaId}`),
    requisitar<{ materias?: MateriaApi[]; detail?: MateriaApi[] }>(`/subjects/materias`),
  ]);

  const p = dados.professor ?? dados.turma.professor;

  return {
    turma: {
      id: dados.turma._id ?? dados.turma.turmaID ?? dados.turma.id ?? turmaId,
      nome: dados.turma.nome ?? "Turma",
      escola: dados.turma.escola ?? "",
      anoLetivo: dados.turma.anoLetivo,
      periodo: dados.turma.periodo,
    },
    professor: p
      ? {
          id: p._id ?? p.professorID ?? p.id ?? "professor",
          nome: p.nome ?? "Professor",
          urlFoto: p.urlFoto,
        }
      : undefined,
    materias: (resMaterias.materias ?? resMaterias.detail ?? []).map((m, i) => ({
      id: m.id ?? m._id ?? m.materiaID ?? String(i),
      nome: m.nome,
    })),
  };
}

/**
 * Lê o link de convite (ex.: luna://app/convite?codigo=ABC&turmaId=123).
 * É o mesmo formato usado na Home — serve para o link colado e para a tag NFC.
 */
export function extrairConvite(link: string): Convite {
  const queryString = link.trim().split("?")[1];
  if (!queryString) throw new Error("Link sem parâmetros.");

  const params = new URLSearchParams(queryString);
  const codigo = params.get("codigo");
  const turmaId = params.get("turmaId");

  if (!codigo || !turmaId) {
    throw new Error("O link de convite está incompleto ou inválido.");
  }
  return { codigo, turmaId };
}

/** Vincula o aluno à turma (mesmo endpoint já usado na Home). */
export async function vincularTurma(userId: string, convite: Convite) {
  return requisitar(`/students/aluno/${userId}/vincular-turma`, {
    method: "PUT",
    body: JSON.stringify({ turmaId: convite.turmaId, codigoAcesso: convite.codigo }),
  });
}

/* ------------------------------------------------------------------ */
/* Mock (para desenvolver o visual sem depender do backend)           */
/* ------------------------------------------------------------------ */

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

let mockVinculado = true; // troque para false para ver a tela "sem turma"

const TURMA_MOCK: TurmaCompleta = {
  turma: {
    id: "turma-mock-1",
    nome: "5º Ano B",
    escola: "Escola Municipal Luna",
    anoLetivo: "2026",
    periodo: "Manhã",
  },
  professor: { id: "p1", nome: "Prof.ª Helena Duarte" },
  materias: [
    { id: "1", nome: "Português" },
    { id: "2", nome: "Matemática" },
    { id: "3", nome: "Geografia" },
    { id: "4", nome: "História" },
    { id: "5", nome: "Ciências" },
  ],
};

export async function buscarTurmaMock(): Promise<TurmaCompleta | null> {
  await esperar(700);
  return mockVinculado ? TURMA_MOCK : null;
}

export async function vincularTurmaMock(): Promise<void> {
  await esperar(900);
  mockVinculado = true;
}

export const LINK_CONVITE_MOCK = "luna://app/convite?codigo=LUNA-5B&turmaId=turma-mock-1";
