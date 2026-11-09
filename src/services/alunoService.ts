import { requisitar } from "./api";

export type AlunoApi = {
  _id?: string;
  usuarioId?: string;
  nome?: string;
  turmaId?: string | null;
  urlFotoAluno?: string | null;
  hiperfoco?: string | null;
};

export type PerfilAlunoResposta = {
  aluno?: AlunoApi;
  materias?: string[];
  erro?: string;
};

/** GET /alunos/:id  (aceita o _id do aluno ou o usuarioId) */
export function buscarAluno(userId: string) {
  return requisitar<PerfilAlunoResposta>(`/alunos/${encodeURIComponent(userId)}`);
}
