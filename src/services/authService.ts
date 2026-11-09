import { requisitar } from "./api";

export type LoginResposta = {
  mensagem?: string;
  usuario?: { _id: string; email: string; tipoUser: string };
  aluno?: { _id: string; nome?: string; turmaId?: string | null } | null;
  materias?: string[];
};

/** POST /auth/login */
export function loginAluno(email: string, senha: string) {
  return requisitar<LoginResposta>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}
