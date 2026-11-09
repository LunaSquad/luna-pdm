/**
 * Aulas 13 e 14 – camada de serviços.
 * Aqui fica só a configuração de rede (URL base + fetch com timeout e erros
 * amigáveis). As telas NUNCA chamam fetch direto: usam as funções de
 * authService, alunoService e turmaService, que chamam `requisitar`.
 */

// Definida no arquivo .env (EXPO_PUBLIC_API_URL). Use https:// em produção.
export const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

if (!BASE_URL) {
  console.warn("A variável EXPO_PUBLIC_API_URL não foi configurada (.env).");
}

type OpcoesRequisicao = RequestInit & {
  /** Tempo máximo de espera. O Render gratuito pode levar ~1 min para "acordar". */
  timeoutMs?: number;
};

export async function requisitar<T>(
  caminho: string,
  { timeoutMs = 60000, headers, ...opcoes }: OpcoesRequisicao = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resposta = await fetch(`${BASE_URL}${caminho}`, {
      ...opcoes,
      headers: { "Content-Type": "application/json", ...headers },
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
    if (erro?.name === "AbortError") {
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
