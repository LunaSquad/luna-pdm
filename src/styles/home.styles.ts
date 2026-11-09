import { StyleSheet } from "react-native";
import { theme } from "./theme";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: theme.spacing.xl,
  },

  navbar: {
    width: "100%",
    height: "11%",
    marginTop: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  menu: {
    width: 30,
    height: 30,
  },

  profilePhoto: {
    width: 45,
    height: 45,
    borderRadius: theme.radius.full,
  },

  spaceLogo: {
    width: "100%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -25,
  },

  spaceNameUsuario: {
    width: "100%",
    height: 30,
    marginTop: theme.spacing.xl,
    marginBottom: -10,
    display: "flex",
    paddingLeft: 10,
    justifyContent: "center",
  },

  nameUsuario: {
    fontWeight: "bold",
    fontSize: 20,
  },

  spaceHiperfocoAux: {
    width: "100%",
    height: 200,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: theme.spacing.xl,
    overflow: "visible",
  },

  spaceHiperfoco: {
    width: "100%",
    height: 160,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingLeft: 34,
    paddingTop: 24,
    position: "relative",
    overflow: "visible",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  hiperfocoContent: {
    zIndex: 2,
  },

  textoHiperfoco: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "bold",
    color: "#fff",
    width: 210,
  },

  hiperfocoActionArea: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  imageSeta: {
    width: 35,
    height: 45,
    resizeMode: "contain",
    marginLeft: 12,
    marginRight: 10,
    marginTop: -22
  },

  bottonHiperfoco: {
    width: 82,
    height: 30,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },

  buttonIconHiperfoco: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },

  luna3d: {
    width: 95,
    height: 165,
    position: "absolute",
    right: -14,
    bottom: -12,
    resizeMode: "contain",
    zIndex: 5,
  },

  spaceMaterias: {
    height: 40,
  },

  spaceTituloMaterias: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  textMaterias: {
    fontWeight: "bold",
    fontSize: theme.fontSize.title,
  },

  textVejamais: {
    fontWeight: "semibold",
    fontSize: theme.fontSize.medium,
    color: theme.colors.borderFirstMatter,
  },

  containerMateria:{
    marginBottom: 20,
  },

  // Estilos para alunos sem turma
  noClassContainer: {
    marginTop: theme.spacing.xx,
    alignItems: "center",
    justifyContent: "center",
    height: 250,
  },
  noClassText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: theme.colors.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  joinClassButton: {
    backgroundColor: theme.colors.primary,
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  joinClassButtonText: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    color: theme.colors.primary,
    marginTop: 12,
    textAlign: "center",
  },
  joinOptionsContainer: {
    width: "100%",
    alignItems: "center",
  },
  joinOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    width: "85%",
    padding: 16,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  joinOptionText: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    color: theme.colors.primary,
    marginLeft: 12,
  },
  cancelJoinButton: {
    marginTop: 8,
    padding: 10,
  },
  cancelJoinText: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: "#EF4444",
  },
  inputLabel: {
    fontFamily: theme.fonts.light,
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: '7.5%'
  },
  inputConvite: {
    width: "85%",
    height: 50,
    backgroundColor: "#F3F4F6",
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 15,
    marginBottom: 15,
    fontFamily: theme.fonts.light,
  },
  btnConfirmar: {
    backgroundColor: theme.colors.primary,
    width: "85%",
    height: 50,
    borderRadius: theme.radius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  btnConfirmarText: {
    color: "#fff",
    fontFamily: theme.fonts.bold,
    fontSize: 16,
  },

  body: {
    flex: 1,
  },

  logo: {
    width: 105,
    height: 25,
    resizeMode: "contain",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 10,
  },

  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#fff",
    zIndex: 20,
    paddingTop: 70,
    paddingHorizontal: 28,
    paddingBottom: 35,
    justifyContent: "space-between",

    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {
      width: 2,
      height: 0,
    },
  },

  drawerProfile: {
    flexDirection: "row",
    alignItems: "center",
  },

  drawerPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },

  drawerName: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: theme.colors.primary,
  },

  drawerSchool: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: 2,
  },

  drawerLine: {
    height: 1,
    backgroundColor: theme.colors.primary,
    marginTop: 35,
    marginBottom: 25,
  },

  drawerLineBottom: {
    height: 1,
    backgroundColor: theme.colors.primary,
    marginBottom: 18,
  },

  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  drawerIcon: {
    width: 24,
    fontSize: 15,
    color: theme.colors.primary,
  },

  drawerText: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    color: theme.colors.primary,
  },


});

export default styles;