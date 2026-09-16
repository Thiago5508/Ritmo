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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function PerfilProfessor() {
  const { user, usuarios } = useAuth();

  const [logoAssessoria, setLogoAssessoria] = useState<string | null>(null);

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
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Card principal */}
        <View style={styles.card}>
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
        </View>

        {/* Informações da empresa */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Dados da assessoria
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Nome
            </Text>

            <Text style={styles.infoValue}>
              Pulsação Assessoria Esportiva
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Professor
            </Text>

            <Text style={styles.infoValue}>
              {user?.nome ?? "Não informado"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Telefone
            </Text>

            <Text style={styles.infoValue}>
              {user?.telefone ?? "Não informado"}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <Link href="/(auth)/mural" asChild>
          <TouchableOpacity style={styles.tabItem}>
            <Image
              source={require("../../../assets/images/sino_icon.png")}
              style={styles.tabIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Link>

        <Link href="/(auth)/planilha" asChild>
          <TouchableOpacity style={styles.tabItem}>
            <Image
              source={require("../../../assets/images/planilha_icon.png")}
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
    backgroundColor: "#f2f2f2",
  },

  scroll: {
    padding: 16,
    gap: 12,
    paddingBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 3,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

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

  logoLarge: {
    width: 110,
    height: 110,
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  infoLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#777",
  },

  infoValue: {
    flex: 1,
    marginLeft: 16,
    textAlign: "right",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#333",
  },

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
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },

  tabItemActive: {
    borderWidth: 1,
    borderColor: "#ED5514",
  },

  tabIcon: {
    width: 25,
  },
});