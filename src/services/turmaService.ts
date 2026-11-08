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

    if (!resposta.ok) {
      throw new Error(
        dados.erro ?? dados.mensagem ?? "Não foi possível completar a requisição."
      );
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

type TurmaApi = {
  emTurma: boolean;
  mensagem?: string;
  turma: {
    _id: string;
    nome: string;
    materias?: string[];
  } | null;
  professor: {
    _id: string;
    nome: string;
    email?: string;
    urlFotoProfessor?: string | null;
  } | null;
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
export async function buscarTurmaDoAluno(
  userId: string
): Promise<TurmaCompleta | null> {

  const dados = await requisitar<TurmaApi>(
    `/alunos/${encodeURIComponent(userId)}/turma`
  );

  if (!dados.emTurma || !dados.turma) {
    return null;
  }

  return {
    turma: {
      id: dados.turma._id,
      nome: dados.turma.nome,
      escola: "",
    },

    professor: dados.professor
      ? {
          id: dados.professor._id,
          nome: dados.professor.nome,
          urlFoto: dados.professor.urlFotoProfessor ?? undefined,
        }
      : undefined,

    materias: (dados.turma.materias ?? []).map((nome, index) => ({
      id: `${index}-${nome}`,
      nome,
    })),
  };
}

/**
 * Lê o link de convite (ex.: luna://app/convite?codigo=ABC&turmaId=123).
 * É o mesmo formato usado na Home — serve para o link colado e para a tag NFC.
 */
export function extrairConvite(link: string): Convite {
  const linkLimpo = link.trim();

  const resultado = linkLimpo.match(
    /^appluna:\/\/turma\/([^/?#]+)\/?$/i
  );

  if (resultado) {
    return {
      turmaId: decodeURIComponent(resultado[1]),
    };
  }

  throw new Error("Link de convite inválido.");
}

/** Vincula o aluno à turma (mesmo endpoint já usado na Home). */
export async function vincularTurma(
  userId: string,
  convite: Convite
) {
  return requisitar(
    `/alunos/${encodeURIComponent(userId)}/turma/vincular`,
    {
      method: "POST",
      body: JSON.stringify({
        turmaId: convite.turmaId,
      }),
    }
  );
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
