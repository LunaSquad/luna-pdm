import { View, Text, Image, StyleSheet } from "react-native";
import { theme } from "../../styles/theme";
import { NfcConviteCard, NfcStatus } from "./nfcConviteCard";
import { CodigoTurmaForm } from "./codigoTurmaForm";

import Luna3d from "../../../assets/luna3d.png";

type Props = {
  nfcStatus: NfcStatus;
  entrandoComCodigo: boolean;
  onLerTag: () => void;
  onCancelarLeitura: () => void;
  onEntrarComCodigo: (texto: string) => void;
};

const PASSOS = [
  "Peça ao professor a tag de convite da turma.",
  "Toque em “Ler tag NFC” aqui embaixo.",
  "Encoste a tag na parte de trás do celular.",
];

/**
 * Tela exibida quando o aluno ainda não tem turma:
 * explica o que fazer, oferece a leitura da tag e uma alternativa manual.
 */
export function SemTurma({
  nfcStatus,
  entrandoComCodigo,
  onLerTag,
  onCancelarLeitura,
  onEntrarComCodigo,
}: Props) {
  return (
    <View>
      <View style={styles.boasVindas}>
        <View style={styles.textos}>
          <Text style={styles.rotulo}>SUA TURMA</Text>
          <Text style={styles.titulo}>Você ainda não está em uma turma</Text>
          <Text style={styles.subtitulo}>
            Entre na turma para ver o professor e as matérias.
          </Text>
        </View>
        <Image source={Luna3d} style={styles.luna} />
      </View>

      <View style={styles.passos}>
        {PASSOS.map((passo, index) => (
          <View key={passo} style={styles.passo}>
            <View style={styles.numero}>
              <Text style={styles.numeroTexto}>{index + 1}</Text>
            </View>
            <Text style={styles.passoTexto}>{passo}</Text>
          </View>
        ))}
      </View>

      <NfcConviteCard
        status={nfcStatus}
        temTurma={false}
        onPress={onLerTag}
        onCancelar={onCancelarLeitura}
      />

      <CodigoTurmaForm onEnviar={onEntrarComCodigo} carregando={entrandoComCodigo} />
    </View>
  );
}

const styles = StyleSheet.create({
  boasVindas: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    minHeight: 140,
    justifyContent: "center",
    overflow: "hidden",
  },
  textos: {
    paddingRight: 70,
  },
  rotulo: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.small,
    letterSpacing: 1.5,
    color: theme.colors.secondary,
  },
  titulo: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.large,
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  subtitulo: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.textPrimary,
    opacity: 0.85,
    marginTop: 4,
  },
  luna: {
    width: 80,
    height: 140,
    position: "absolute",
    right: -6,
    bottom: -8,
    resizeMode: "contain",
  },
  passos: {
    marginVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  passo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  numero: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  numeroTexto: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.medium,
    color: theme.colors.borderThirdMatter,
  },
  passoTexto: {
    flex: 1,
    fontSize: theme.fontSize.medium,
    color: theme.colors.textDark,
  },
});
