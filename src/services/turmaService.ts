import { requisitar } from "./api";

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

/** Formato que a API devolve em GET /alunos/:id/turma e POST .../vincular */
type TurmaApi = {
  emTurma: boolean;
  mensagem?: string;
  turma: {
    _id: string;
    nome: string;
    codigoConvite?: string;
    materias?: string[];
  } | null;
  professor: {
    _id: string;
    nome: string;
    email?: string;
    urlFotoProfessor?: string | null;
  } | null;
};

/* ------------------------------------------------------------------ */
/* Conversão API -> modelo usado pelas telas                          */
/* ------------------------------------------------------------------ */

function mapearTurma(dados: TurmaApi): TurmaCompleta | null {
  if (!dados.emTurma || !dados.turma) return null;

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

/* ------------------------------------------------------------------ */
/* Endpoints                                                          */
/* ------------------------------------------------------------------ */

/**
 * GET /alunos/:id/turma
 * Retorna null quando o aluno ainda não está em nenhuma turma
 * (a tela então mostra o estado "sem turma").
 */
export async function buscarTurmaDoAluno(userId: string): Promise<TurmaCompleta | null> {
  const dados = await requisitar<TurmaApi>(`/alunos/${encodeURIComponent(userId)}/turma`);
  return mapearTurma(dados);
}

/**
 * Lê o que veio da tag NFC (ou digitado/colado) e devolve o id da turma.
 * Formatos aceitos:
 *   appluna://turma/6aea297b7e5984a2a167be19   <- o recomendado para gravar na tag
 *   6aea297b7e5984a2a167be19                   <- só o id também funciona
 */
export function extrairConvite(texto: string): Convite {
  const limpo = texto.trim();

  const link = limpo.match(/^[a-z][a-z0-9+.-]*:\/\/turma\/([^/?#\s]+)\/?$/i);
  const turmaId = link ? decodeURIComponent(link[1]) : limpo;

  // ObjectId do MongoDB = 24 caracteres hexadecimais
  if (!/^[a-f0-9]{24}$/i.test(turmaId)) {
    throw new Error(
      "Essa tag não é um convite de turma válido. Peça ao professor para gravar de novo."
    );
  }

  return { turmaId };
}

/**
 * POST /alunos/:id/turma/vincular  { turmaId }
 * Já devolve a turma completa, então a tela atualiza sem nova requisição.
 */
export async function vincularTurma(userId: string, convite: Convite) {
  const dados = await requisitar<TurmaApi>(
    `/alunos/${encodeURIComponent(userId)}/turma/vincular`,
    {
      method: "POST",
      body: JSON.stringify({ turmaId: convite.turmaId }),
    }
  );

  return {
    mensagem: dados.mensagem ?? "Você entrou na turma!",
    turma: mapearTurma(dados),
  };
}
