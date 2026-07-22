import { Feather, Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Futuramente virá de uma API/banco de dados
const STATS = {
  total: 91,
  iniciantes: 32,
  intermediarios: 41,
  avancados: 18,
};

export default function PerfilProfessor() {
  const [nomeAssessoria, setNomeAssessoria] = useState("Pulsação Assessoria Esportiva");
  const [editingNome, setEditingNome] = useState(false);
  const [nomeDraft, setNomeDraft] = useState(nomeAssessoria);

  const saveNome = () => {
    setNomeAssessoria(nomeDraft);
    setEditingNome(false);
  };

  const cancelNome = () => {
    setNomeDraft(nomeAssessoria);
    setEditingNome(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
          <Link href="/home" asChild>
            <TouchableOpacity style={styles.backBtn}>
              <Ionicons name="exit-outline" size={22} color="#333" />
            </TouchableOpacity>
          </Link>
          <Text style={styles.headerTitle}>Pulsação Assessoria Esportiva</Text>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Card logo + stats */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            {/* Logo */}
            <View style={styles.logoBox}>
              <Image
                source={require("../../../assets/images/logo.png")}
                style={styles.logoLarge}
                resizeMode="contain"
              />
              <TouchableOpacity style={styles.editLogoBtn}>
                <Feather name="edit-2" size={14} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Estatísticas */}
            <View style={styles.statsBox}>
              <Text style={styles.statsTotal}>{STATS.total} Alunos</Text>
              <Text style={styles.statItem}>{STATS.iniciantes} Iniciantes</Text>
              <Text style={styles.statItem}>{STATS.intermediarios} Intermediários</Text>
              <Text style={styles.statItem}>{STATS.avancados} Avançados</Text>
            </View>
          </View>
        </View>

        {/* Card nome da assessoria */}
        <View style={styles.card}>
          <View style={styles.nomeRow}>
            {editingNome ? (
              <TextInput
                style={styles.nomeInput}
                value={nomeDraft}
                onChangeText={setNomeDraft}
                autoFocus
              />
            ) : (
              <Text style={styles.nomeText}>{nomeAssessoria}</Text>
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
        </View>

      </ScrollView>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <Link href="/(auth)/mural" asChild>
          <TouchableOpacity style={styles.tabItem}>
            <Image source={require("../../../assets/images/sino_icon.png")} style={styles.tabIcon} resizeMode="contain" />
          </TouchableOpacity>
        </Link>
        <Link href="/(auth)/planilha" asChild>
          <TouchableOpacity style={styles.tabItem}>
            <Image source={require("../../../assets/images/planilha_icon.png")} style={styles.tabIcon} resizeMode="contain" />
          </TouchableOpacity>
        </Link>
        <TouchableOpacity style={[styles.tabItem, styles.tabItemActive]}>
          <Image source={require("../../../assets/images/perfil_icon.png")} style={styles.tabIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f2f2f2" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#333",
    marginHorizontal: 8,
  },
  logo: { width: 44, height: 44, borderRadius: 6 },

  // Scroll
  scroll: { padding: 16, gap: 12 },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  // Card top (logo + stats)
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  // Logo box
  logoBox: {
    position: "relative",
    width: 120,
    height: 120,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  logoLarge: { width: 110, height: 110 },
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

  // Stats
  statsBox: { flex: 1, gap: 4 },
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

  // Nome assessoria
  nomeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  nomeText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#333",
  },
  nomeInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#ED5514",
    paddingVertical: 2,
  },
  editActions: { flexDirection: "row", gap: 12 },

  // Tab Bar
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  tabItem: {
    width: 50,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  tabItemActive: { borderWidth: 2, borderColor: "#ED5514" },
  tabIcon: { width: 25 },
});