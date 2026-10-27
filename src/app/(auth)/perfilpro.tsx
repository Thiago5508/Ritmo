import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function PerfilProfessor() {
  const { user, usuarios } = useAuth();

  const [logoAssessoria, setLogoAssessoria] = useState<string | null>(null);

  // Editar nome da assessoria
const [nomeAssessoria, setNomeAssessoria] = useState("Pulsação Assessoria Esportiva");
const [editingNome, setEditingNome] = useState(false);
const [nomeDraft, setNomeDraft] = useState(nomeAssessoria);

const saveNome = () => {
  if (!nomeDraft.trim()) return;
  setNomeAssessoria(nomeDraft.trim());
  setEditingNome(false);
};

const cancelNome = () => {
  setNomeDraft(nomeAssessoria);
  setEditingNome(false);
};
  // Apenas alunos
  const alunos = usuarios.filter((usuario) => !usuario.isProfessor);

  const STATS = {
    total: alunos.length,
    iniciantes: alunos.filter((a) => a.nivel === "iniciante").length,
    intermediarios: alunos.filter((a) => a.nivel === "intermediario").length,
    avancados: alunos.filter((a) => a.nivel === "avancado").length,
  };

  const editarLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setLogoAssessoria(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
            <View style={styles.header}>
            <TouchableOpacity
                style={styles.backBtn}
                onPress={() => {
                logout();
                router.replace("/home");
                          }}
                        >
              <Image source={require("../../../assets/images/exit_icon.png")} style={styles.tabIcon} resizeMode="contain" />
            </TouchableOpacity>
              <Text style={styles.headerTitle}>
                Pulsação Assessoria Esportiva
              </Text>
      
              <Link href="/(auth)/alunos" asChild>
                <TouchableOpacity>
                  <Image
                    source={require("../../../assets/images/logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </Link>
            </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Card principal */}
          <View style={styles.cardTop}>
            {/* Logo da assessoria */}
            <View style={styles.logoBox}>
              <Image
                source={
                  logoAssessoria
                    ? { uri: logoAssessoria }
                    : require("../../../assets/images/logo.png")
                }
                style={styles.logoLarge}
                resizeMode="contain"
              />

              <TouchableOpacity
                style={styles.editLogoBtn}
                onPress={editarLogo}
              >
                <Feather
                  name="edit-2"
                  size={14}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            {/* Estatísticas */}
            <View style={styles.statsBox}>
              <Text style={styles.statsTotal}>
                {STATS.total} Alunos
              </Text>

              <Text style={styles.statItem}>
                {STATS.iniciantes} Iniciantes
              </Text>

              <Text style={styles.statItem}>
                {STATS.intermediarios} Intermediários
              </Text>

              <Text style={styles.statItem}>
                {STATS.avancados} Avançados
              </Text>
            </View>
          </View>

        {/* Informações da empresa */}
        <View style={styles.card}>
<View style={styles.infoRow}>
  {editingNome ? (
    <TextInput
      style={styles.infoInput}
      value={nomeDraft}
      onChangeText={setNomeDraft}
      autoFocus
    />
  ) : (
    <Text style={styles.infoValue}>{nomeAssessoria}</Text>
  )}

  {editingNome ? (
    <View style={styles.editActions}>
      <TouchableOpacity onPress={cancelNome}>
        <Feather name="x" size={18} color="#E63946" />
      </TouchableOpacity>
      <TouchableOpacity onPress={saveNome}>
        <Feather name="check" size={18} color="#2A9D62" />
      </TouchableOpacity>
    </View>
  ) : (
    <TouchableOpacity onPress={() => setEditingNome(true)}>
      <Feather name="edit-2" size={18} color="#ED5514" />
    </TouchableOpacity>
  )}
</View>

          <View style={styles.infoRow}>
            <Text style={styles.infoTel}>
              {user?.telefone ?? "Não informado"}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
                <Link href="/(auth)/home" asChild>
          <TouchableOpacity style={styles.tabItem}>
            <Image
              source={require("../../../assets/images/home_icon.png")}
              style={styles.tabIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Link>
        <Link href="/(auth)/mural" asChild>
          <TouchableOpacity style={styles.tabItem}>
            <Image
              source={require("../../../assets/images/sino_icon.png")}
              style={styles.tabIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Link>
        <TouchableOpacity
          style={[styles.tabItem, styles.tabItemActive]}
        >
          <Image
            source={require("../../../assets/images/perfil_icon.png")}
            style={styles.tabIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

   header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 3,
  },
    backBtn: { 
    width: 38, 
    height: 38, 
    borderRadius: 6, 
    borderWidth: 1, 
    borderColor: "#ddd", 
    alignItems: "center", 
    justifyContent: "center" 
  },

    logo: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#333",
    marginHorizontal: 8,
  },

  scroll: {
    padding: 16,
    gap: 12,
    paddingBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 3,
  },

  infoInput: {
  flex: 1,
  marginLeft: 16,
  fontFamily: "Inter_600SemiBold",
  fontSize: 14,
  color: "#333",
  borderBottomWidth: 1,
  borderBottomColor: "#ED5514",
  paddingVertical: 2,
  },
  
editActions: { flexDirection: "row", gap: 12 },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 50,
    
  },

  logoBox: {
    position: "relative",
    width: 150,
    height: 150,
    marginRight: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 6, 
    elevation: 5 },
 
    tabIcon: { 
    width: 25 
  },

  logoLarge: {
    width: 150,
    height: 150,
  },

  editLogoBtn: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#ED5514",
    alignItems: "center",
    justifyContent: "center",
  },

  statsBox: {
    flex: 1,
    gap: 4,
  },

  statsTotal: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#ED5514",
    marginBottom: 6,
  },

  statItem: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#333",
  },

  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },

  infoLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#777",
  },

  infoValue: {
    flex: 1,
    marginLeft: 16,
    textAlign: "left",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#333",
  },
  infoTel: {
    flex: 1,
    marginLeft: 16,
    textAlign: "left",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#ED5514",
  },
tabBar: {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  paddingVertical: 12,
  paddingBottom: 34, // <- adicione
  backgroundColor: "#fff",
 },

  tabItem: { 
    width: 50, 
    height: 50, 
    backgroundColor: "#fff", 
    borderRadius: 8, 
    justifyContent: "center", 
    alignItems: "center", 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5 },
  tabIcon: { 
    width: 25 
  },

  tabItemActive: {
    borderWidth: 1,
    borderColor: "#ED5514",
  },

});