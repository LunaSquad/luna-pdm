/**
 * Aula 15 – recursos nativos (NFC).
 *
 * Lê a primeira mensagem NDEF de uma tag e devolve o texto gravado nela
 * (ex.: "appluna://turma/6aea297b7e5984a2a167be19"). Quem decide o que fazer
 * com o texto é o turmaService (extrairConvite + vincularTurma).
 *
 * ⚠️ react-native-nfc-manager tem código nativo: NÃO funciona no Expo Go.
 *    Precisa de um development build (veja docs/NFC.md).
 *    Por isso a biblioteca é carregada só quando o aluno toca em "Ler tag":
 *    no Expo Go o app continua abrindo normalmente e mostra um aviso.
 */
import { Platform } from "react-native";

export type CodigoErroNfc =
  | "indisponivel" // Expo Go / app sem o módulo nativo
  | "sem-suporte" // aparelho sem NFC
  | "desligado" // NFC desligado nas configurações (Android)
  | "cancelado" // aluno cancelou a leitura
  | "tag-invalida"; // tag vazia, sem NDEF ou ilegível

export type ErroNfc = Error & { codigo: CodigoErroNfc };

function erroNfc(codigo: CodigoErroNfc, mensagem: string): ErroNfc {
  return Object.assign(new Error(mensagem), { codigo });
}

/** Devolve o código do erro NFC (ou undefined se for outro tipo de erro). */
export function codigoDoErro(e: unknown): CodigoErroNfc | undefined {
  return (e as Partial<ErroNfc> | undefined)?.codigo;
}

async function carregarModulo() {
  try {
    const modulo = await import("react-native-nfc-manager");
    return { NfcManager: modulo.default, NfcTech: modulo.NfcTech };
  } catch {
    throw erroNfc(
      "indisponivel",
      "O NFC não está disponível nesta versão do app. Use o development build (não o Expo Go)."
    );
  }
}

/* ------------------------- decodificação NDEF ------------------------- */

type RegistroNdef = { tnf: number; type: number[] | string; payload: number[] };

const TNF_WELL_KNOWN = 1;
const PREFIXOS_URI = ["", "http://www.", "https://www.", "http://", "https://"];

// bytes UTF-8 -> string
function bytesParaTexto(bytes: number[]): string {
  try {
    return decodeURIComponent(bytes.map((b) => "%" + b.toString(16).padStart(2, "0")).join(""));
  } catch {
    return String.fromCharCode(...bytes);
  }
}

function tipoDoRegistro(r: RegistroNdef): string {
  return Array.isArray(r.type) ? String.fromCharCode(...r.type) : String(r.type);
}

/** Registro de Texto ("T") ou de URI ("U") -> string. Outros tipos -> null. */
function registroParaTexto(r: RegistroNdef): string | null {
  if (r.tnf !== TNF_WELL_KNOWN || !r.payload?.length) return null;

  const tipo = tipoDoRegistro(r);

  if (tipo === "T") {
    // 1º byte: bits 0-5 = tamanho do idioma ("pt", "en"...). Depois vem o texto.
    const tamanhoIdioma = r.payload[0] & 0x3f;
    return bytesParaTexto(r.payload.slice(1 + tamanhoIdioma)).trim();
  }

  if (tipo === "U") {
    // 1º byte: código do prefixo (0 = URI completa, como "appluna://turma/...")
    const prefixo = PREFIXOS_URI[r.payload[0]] ?? "";
    return (prefixo + bytesParaTexto(r.payload.slice(1))).trim();
  }

  return null;
}

/* ------------------------------ API pública ------------------------------ */

let cancelado = false;

/** Abre as configurações de NFC do celular (usado quando o NFC está desligado). */
export async function abrirConfiguracoesNfc() {
  try {
    const { NfcManager } = await carregarModulo();
    await NfcManager.goToNfcSetting();
  } catch {
    /* sem ação: o aluno liga manualmente */
  }
}

/** Interrompe uma leitura em andamento (botão "Cancelar" ou troca de tela). */
export async function cancelarLeituraNfc() {
  cancelado = true;
  try {
    const { NfcManager } = await carregarModulo();
    await NfcManager.cancelTechnologyRequest();
  } catch {
    /* nada a cancelar */
  }
}

/**
 * Espera o aluno aproximar a tag e devolve o texto gravado nela.
 * Lança um ErroNfc (veja `codigoDoErro`) quando algo impede a leitura.
 */
export async function lerTagNfc(): Promise<string> {
  cancelado = false;
  const { NfcManager, NfcTech } = await carregarModulo();

  try {
    if (!(await NfcManager.isSupported())) {
      throw erroNfc("sem-suporte", "Este aparelho não tem NFC.");
    }
    await NfcManager.start();
  } catch (e) {
    if (codigoDoErro(e)) throw e;
    throw erroNfc(
      "indisponivel",
      "O NFC não está disponível nesta versão do app. Use o development build (não o Expo Go)."
    );
  }

  if (Platform.OS === "android" && !(await NfcManager.isEnabled())) {
    throw erroNfc("desligado", "O NFC está desligado. Ligue-o nas configurações do celular.");
  }

  try {
    await NfcManager.requestTechnology(NfcTech.Ndef); // fica esperando a tag
    const tag = await NfcManager.getTag();
    const registros = (tag?.ndefMessage ?? []) as unknown as RegistroNdef[];

    for (const registro of registros) {
      const texto = registroParaTexto(registro);
      if (texto) return texto;
    }

    throw erroNfc("tag-invalida", "A tag está vazia ou não tem um convite da Luna.");
  } catch (e) {
    if (codigoDoErro(e) && codigoDoErro(e) !== "cancelado") throw e;
    if (cancelado || /cancel/i.test(String(e))) {
      throw erroNfc("cancelado", "Leitura cancelada.");
    }
    throw erroNfc("tag-invalida", "Não foi possível ler a tag. Aproxime de novo e segure um instante.");
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}
