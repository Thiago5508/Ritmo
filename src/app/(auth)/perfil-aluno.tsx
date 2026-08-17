import { Feather } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function PerfilAluno() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [fotoCapa, setFotoCapa] = useState<string | null>(null);
  const nomeAluno = user?.nome ?? "";
  const [textoLivre, setTextoLivre] = useState("");
  const [editandoInfo, setEditandoInfo] = useState(false);
  const [draftTexto, setDraftTexto] = useState(textoLivre);

  const editarFotoCapa = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [16, 9],
    quality: 1,
  });

  if (!result.canceled) {
    setFotoCapa(result.assets[0].uri);
  }
};

  const salvarInfo = () => {
    setTextoLivre(draftTexto);
    setEditandoInfo(false);
  };

  const cancelarInfo = () => {
    setDraftTexto(textoLivre);
    setEditandoInfo(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        
        <Text style={styles.headerTitle}>Pulsação Assessoria Esportiva</Text>
        <Link href="/(auth)/alunos" asChild>
          <TouchableOpacity>
            <Image source={require("../../../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
          </TouchableOpacity>
        </Link>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Foto de capa */}
        <View style={styles.coverBox}>
          <Image
            source={
              fotoCapa
                ? { uri: fotoCapa }
                : require("../../../assets/images/background.jpg")
            }
            style={styles.coverImage}
            resizeMode="cover"
          />
          {/* Botão editar foto */}
          <TouchableOpacity style={styles.editCoverBtn} onPress={editarFotoCapa}>
            <Feather name="edit-2" size={14} color="#ED5514" />
          </TouchableOpacity>
          {/* Nome sobre a foto */}
          <View style={styles.coverName}>
            <Text style={styles.coverNameText}>{nomeAluno}</Text>
          </View>
        </View>

        {/* Card info */}
        <View style={styles.card}>
          {editandoInfo ? (
            <>
              <TextInput
                style={styles.input}
                value={draftTexto}
                onChangeText={setDraftTexto}
                placeholder="Ex: 🥇 10k"
                placeholderTextColor="#bbb"
                multiline
                textAlignVertical="top"
              />
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={cancelarInfo}>
                  <Feather name="x" size={18} color="#E63946" />
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={salvarInfo}>
                  <Feather name="check" size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.textoLivre}>{textoLivre}</Text>
              <TouchableOpacity style={styles.editInfoBtn} onPress={() => { setDraftTexto(textoLivre); setEditandoInfo(true); }}>
                <Feather name="edit-2" size={16} color="#ED5514" />
              </TouchableOpacity>
            </>
          )}
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
    shadowOffset: { width: 0, height: 2 }, 
    elevation: 3,
  },
  backBtn: { width: 38, height: 38, borderRadius: 6, borderWidth: 1, borderColor: "#ddd", alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#333", marginHorizontal: 8 },
  logo: { width: 44, height: 44, borderRadius: 6 },

  scroll: { paddingBottom: 24 },

  coverBox: { marginTop: 16, position: "relative", paddingHorizontal: 16 },
  coverImage: { width: "100%", height: 418, alignContent: "center", alignSelf: "center", borderRadius: 6 },
  editCoverBtn: {
    position: "absolute", top: 12, right: 30,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  coverName: {
    position: "absolute", bottom: 30, left: 40, width: "auto", borderRadius: 6, alignItems: "flex-start", justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.63)", paddingHorizontal: 15, paddingVertical: 6,
  },
  coverNameText: { fontFamily: "Inter_400Regular", fontSize: 16, color: "#fff" },

  card: {
    backgroundColor: "#fff", borderRadius: 6, margin: 16, marginTop: 12,
    padding: 16, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  textoLivre: { fontFamily: "Inter_400Regular", fontSize: 15, color: "#333", marginBottom: 10 },
  editInfoBtn: { alignSelf: "flex-end", marginTop: 12 },

  input: {
    minHeight: 100,
    borderWidth: 1, 
    borderColor: "#eee", 
    borderRadius: 6,
    padding: 12, 
    fontFamily: "Inter_400Regular", 
    fontSize: 14,
    color: "#333", 
    marginBottom: 10,
    textAlignVertical: "top",
  },
  editActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  saveBtn: { flex: 1, flexDirection: "row", backgroundColor: "#ED5514", borderRadius: 6, padding: 12, alignItems: "center", justifyContent: "center", gap: 6 },
  saveBtnText: { fontFamily: "Inter_600SemiBold", color: "#fff", fontSize: 14 },
  cancelBtn: { flex: 1, flexDirection: "row", borderWidth: 1, borderColor: "#eee", borderRadius: 6, padding: 12, alignItems: "center", justifyContent: "center", gap: 6 },
  cancelBtnText: { fontFamily: "Inter_600SemiBold", color: "#E63946", fontSize: 14 },

  tabBar: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#eee" },
  tabItem: { width: 50, height: 50, backgroundColor: "#fff", borderRadius: 8, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5 },
  tabItemActive: { borderWidth: 1, borderColor: "#ED5514" },
  tabIcon: { width: 25 },
});