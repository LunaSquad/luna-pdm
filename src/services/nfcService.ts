import { Platform } from "react-native";

export type CodigoErroNfc =
  | "indisponivel" // Expo Go / app sem o módulo nativo
  | "sem-suporte" // aparelho sem NFC
  | "desligado" // NFC desligado nas configurações
  | "cancelado" // aluno cancelou a leitura
  | "tag-invalida"; // tag vazia, sem NDEF ou ilegível

export type ErroNfc = Error & { codigo: CodigoErroNfc };

function erroNfc(codigo: CodigoErroNfc, mensagem: string): ErroNfc {
  return Object.assign(new Error(mensagem), { codigo });
}

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
function registroParaTexto(r: RegistroNdef): string | null {
  if (r.tnf !== TNF_WELL_KNOWN || !r.payload?.length) return null;

  const tipo = tipoDoRegistro(r);

  if (tipo === "T") {
    const tamanhoIdioma = r.payload[0] & 0x3f;
    return bytesParaTexto(r.payload.slice(1 + tamanhoIdioma)).trim();
  }

  if (tipo === "U") {
    const prefixo = PREFIXOS_URI[r.payload[0]] ?? "";
    return (prefixo + bytesParaTexto(r.payload.slice(1))).trim();
  }

  return null;
}

/* ------------------------------ API pública ------------------------------ */

let cancelado = false;

export async function abrirConfiguracoesNfc() {
  try {
    const { NfcManager } = await carregarModulo();
    await NfcManager.goToNfcSetting();
  } catch {
  }
}

export async function cancelarLeituraNfc() {
  cancelado = true;
  try {
    const { NfcManager } = await carregarModulo();
    await NfcManager.cancelTechnologyRequest();
  } catch {
  }
}
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
