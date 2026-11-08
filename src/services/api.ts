export const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  console.warn("A variável EXPO_PUBLIC_API_URL não foi configurada.");
}


export async function loginAluno(email: string, senha: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const resposta = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
      signal: controller.signal,
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(dados.erro ?? 'E-mail ou senha inválidos.');
    }

    return dados;
  } catch (erro: any) {
    if (erro.name === 'AbortError') {
      throw new Error('O servidor demorou para responder. Tente de novo.');
    }

    throw erro;
  } finally {
    clearTimeout(timeout);
  }
}
