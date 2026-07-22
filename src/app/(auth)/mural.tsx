import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Message {
  id: number;
  text: string;
  time: string;
  date: string;
}

function getCurrentTime() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function getCurrentDate() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();
  return `${d}/${m}/${y}`;
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, text: "Passando para lembrar que amanhã temos nosso primeiro encontro", time: "17:45", date: "05/06/2026" },
  { id: 2, text: "Marcado às 05:00 da manhã no mirante da treze!", time: "17:45", date: "05/06/2026" },
];

export default function MuralScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now(),
      text: input.trim(),
      time: getCurrentTime(),
      date: getCurrentDate(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  const askDelete = (id: number) => {
    setDeleteTarget(id);
    setConfirmVisible(true);
  };

  const confirmDelete = () => {
    setMessages((prev) => prev.filter((m) => m.id !== deleteTarget));
    setDeleteTarget(null);
    setConfirmVisible(false);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    setConfirmVisible(false);
  };

  const groupedItems: { type: "date" | "message"; value?: string; item?: Message }[] = [];
  let lastDate = "";
  messages.forEach((msg) => {
    if (msg.date !== lastDate) {
      groupedItems.push({ type: "date", value: msg.date });
      lastDate = msg.date;
    }
    groupedItems.push({ type: "message", item: msg });
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>Mural de avisos</Text>
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={groupedItems}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            if (item.type === "date") {
              return <Text style={styles.dateLabel}>{item.value}</Text>;
            }
            const msg = item.item!;
            return (
              <View style={styles.bubble}>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => askDelete(msg.id)}>
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.bubbleText}>{msg.text}</Text>
                <Text style={styles.bubbleTime}>{msg.time}</Text>
              </View>
            );
          }}
        />

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Digite um aviso..."
            placeholderTextColor="#bbb"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="play" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

{/* Tab Bar */}
<View style={styles.tabBar}>

  <TouchableOpacity style={[styles.tabItem, styles.tabItemActive]}>
    <Image source={require("../../../assets/images/sino_icon.png")} style={styles.tabIcon} resizeMode="contain" />
  </TouchableOpacity>

  <Link href="/(auth)/planilha" asChild>
    <TouchableOpacity style={styles.tabItem}>
      <Image source={require("../../../assets/images/planilha_icon.png")} style={styles.tabIcon} resizeMode="contain" />
    </TouchableOpacity>
  </Link>

<Link href="/(auth)/perfilpro" asChild>
  <TouchableOpacity style={styles.tabItem}>
    <Image source={require("../../../assets/images/perfil_icon.png")} style={styles.tabIcon} resizeMode="contain" />
  </TouchableOpacity>
</Link>

</View>

      {/* Modal confirmação */}
      <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={cancelDelete}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Excluir aviso</Text>
            <Text style={styles.modalDesc}>Tem certeza que deseja excluir este aviso?</Text>
            <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmDelete}>
              <Text style={styles.modalConfirmText}>Excluir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={cancelDelete}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerLeft: { width: 44 },
  headerTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#fff" },
  logo: { width: 44, height: 44, borderRadius: 22 },

  list: { padding: 16, paddingBottom: 8 },
  dateLabel: { textAlign: "center", fontFamily: "Inter_400Regular", fontSize: 12, color: "#aaa", marginVertical: 8 },

  bubble: { backgroundColor: "#ED5514", borderRadius: 10, padding: 12, marginBottom: 10, position: "relative" },
  bubbleText: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#fff", marginRight: 24 },
  bubbleTime: { fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(255,255,255,0.7)", textAlign: "right", marginTop: 4 },
  deleteBtn: { position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.2)", alignItems: "center", justifyContent: "center" },

  inputRow: { flexDirection: "row", alignItems: "center", padding: 12, borderTopWidth: 1, borderTopColor: "#eee", gap: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: "#eee", borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontFamily: "Inter_400Regular", fontSize: 14, color: "#333", maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#ED5514", alignItems: "center", justifyContent: "center" },

  tabBar: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#eee" },
  tabItem: { width: 50, height: 50, backgroundColor: "#fff", borderRadius: 8, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5 },
  tabItemActive: { borderWidth: 2, borderColor: "#ED5514" },
  tabIcon: { width: 25 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  modalCard: { width: "80%", backgroundColor: "#fff", borderRadius: 12, padding: 24, alignItems: "center" },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#1a1a1a", marginBottom: 8 },
  modalDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#555", textAlign: "center", marginBottom: 20 },
  modalConfirmBtn: { width: "100%", backgroundColor: "#E63946", borderRadius: 8, padding: 14, alignItems: "center", marginBottom: 8 },
  modalConfirmText: { fontFamily: "Inter_600SemiBold", color: "#fff", fontSize: 15 },
  modalCancelBtn: { width: "100%", padding: 14, alignItems: "center" },
  modalCancelText: { fontFamily: "Inter_600SemiBold", color: "#333", fontSize: 15 },
});