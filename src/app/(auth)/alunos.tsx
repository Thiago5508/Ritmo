import { Feather, Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Aluno {
  id: number;
  nome: string;
  nivel: "Iniciante" | "Intermediário" | "Avançado";
  foto: string | null;
  telefone: string;
}

const NIVEIS = ["Iniciante", "Intermediário", "Avançado"];

const INITIAL_ALUNOS: Aluno[] = [
  { id: 1, nome: "João Paulo Correia Santos", nivel: "Iniciante", foto: null, telefone: "" },
  { id: 2, nome: "Anna Luiza Souza", nivel: "Intermediário", foto: null, telefone: "" },
  { id: 3, nome: "Wagner Alves Pereira", nivel: "Avançado", foto: null, telefone: "" },
  { id: 4, nome: "Júlio Quaresma Mendonça", nivel: "Iniciante", foto: null, telefone: "" },
  { id: 5, nome: "Daiane Alencar Vianna", nivel: "Intermediário", foto: null, telefone: "" },
  { id: 6, nome: "Hebert Aguiar Feitosa", nivel: "Avançado", foto: null, telefone: "" },
  { id: 7, nome: "Lucas Andrade Santos", nivel: "Iniciante", foto: null, telefone: "" },
  { id: 8, nome: "Sthephanie Lourenço Neves", nivel: "Intermediário", foto: null, telefone: "" },
  { id: 9, nome: "Raíssa Fernanda Lima", nivel: "Iniciante", foto: null, telefone: "" },
  { id: 10, nome: "Edilson Couto Garcia", nivel: "Avançado", foto: null, telefone: "" },
  { id: 11, nome: "Heric Brito Souza", nivel: "Intermediário", foto: null, telefone: "" },
];

const EMPTY_FORM = { nome: "", nivel: "", telefone: "", senha: "", confirmSenha: "" };

// Futuramente virá do contexto de autenticação
const isProfessor = true;

export default function AlunosScreen() {
  const [alunos, setAlunos] = useState<Aluno[]>(INITIAL_ALUNOS);
  const [modalVisible, setModalVisible] = useState(false);
  const [nivelModalVisible, setNivelModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [erros, setErros] = useState<string[]>([]);

  const openModal = () => {
    setForm(EMPTY_FORM);
    setErros([]);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setForm(EMPTY_FORM);
    setErros([]);
  };

  const selectNivel = (nivel: string) => {
    setForm((prev) => ({ ...prev, nivel }));
    setNivelModalVisible(false);
  };

  const salvar = () => {
    const novosErros: string[] = [];
    if (!form.nome.trim()) novosErros.push("Nome é obrigatório.");
    if (!form.nivel) novosErros.push("Selecione um nível.");
    if (!form.telefone.trim()) novosErros.push("Telefone é obrigatório.");
    if (!form.senha.trim()) novosErros.push("Crie uma senha.");
    if (form.senha !== form.confirmSenha) novosErros.push("As senhas não coincidem.");

    if (novosErros.length > 0) {
      setErros(novosErros);
      return;
    }

    const novoAluno: Aluno = {
      id: Date.now(),
      nome: form.nome.trim(),
      nivel: form.nivel as Aluno["nivel"],
      foto: null,
      telefone: form.telefone.trim(),
    };

    setAlunos((prev) => [...prev, novoAluno]);
    closeModal();
  };

  const getInitials = (nome: string) => {
    const parts = nome.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Link href="/(auth)/planilha" asChild>
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

      {/* Barra de ações */}
      <View style={styles.actionsRow}>
        {isProfessor ? (
          <TouchableOpacity style={styles.addBtn} onPress={openModal}>
            <Feather name="plus" size={20} color="#ED5514" />
          </TouchableOpacity>
        ) : (
          <View style={styles.addBtn} />
        )}
        <Text style={styles.totalText}>{alunos.length} Alunos</Text>
      </View>

      {/* Lista de alunos */}
      <FlatList
        data={alunos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.alunoCard}>
            {item.foto ? (
              <Image source={{ uri: item.foto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{getInitials(item.nome)}</Text>
              </View>
            )}
            <Text style={styles.alunoNome}>{item.nome}</Text>
          </TouchableOpacity>
        )}
      />

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
        <Link href="/(auth)/perfilpro" asChild>
          <TouchableOpacity style={styles.tabItem}>
            <Image source={require("../../../assets/images/perfil_icon.png")} style={styles.tabIcon} resizeMode="contain" />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Modal novo aluno */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalSafe}>
          <Text style={styles.modalTitle}>Adicionar novo aluno</Text>

          <FlatList
            data={[]}
            keyExtractor={() => ""}
            renderItem={null}
            ListHeaderComponent={
              <View style={styles.modalContent}>

                {/* Dados do aluno */}
                <Text style={styles.sectionLabel}>Dados do aluno</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Digite o nome do aluno..."
                  placeholderTextColor="#bbb"
                  value={form.nome}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, nome: text }))}
                />

                <TouchableOpacity
                  style={styles.nivelBtn}
                  onPress={() => setNivelModalVisible(true)}
                >
                  <Text style={styles.nivelBtnText}>
                    {form.nivel || "Selecione o nível"}
                  </Text>
                  <Feather name="chevron-down" size={20} color="#fff" />
                </TouchableOpacity>

                {/* Dados de acesso */}
                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Dados de acesso</Text>

                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Telefone do aluno (apenas números)"
                    placeholderTextColor="#bbb"
                    value={form.telefone}
                    onChangeText={(text) => setForm((prev) => ({ ...prev, telefone: text.replace(/\D/g, "") }))}
                    keyboardType="numeric"
                  />
                  <Ionicons name="alert-circle-outline" size={20} color="#ED5514" style={styles.infoIcon} />
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Crie uma senha"
                  placeholderTextColor="#bbb"
                  value={form.senha}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, senha: text }))}
                  secureTextEntry
                />

                <TextInput
                  style={styles.input}
                  placeholder="Repita a senha"
                  placeholderTextColor="#bbb"
                  value={form.confirmSenha}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, confirmSenha: text }))}
                  secureTextEntry
                />

                {/* Erros */}
                {erros.length > 0 && (
                  <View style={styles.errosBox}>
                    {erros.map((e, i) => (
                      <Text key={i} style={styles.erroText}>• {e}</Text>
                    ))}
                  </View>
                )}

                <TouchableOpacity style={styles.saveBtn} onPress={salvar}>
                  <Text style={styles.saveBtnText}>Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

      {/* Modal seleção de nível */}
      <Modal visible={nivelModalVisible} transparent animationType="fade" onRequestClose={() => setNivelModalVisible(false)}>
        <TouchableOpacity style={styles.nivelOverlay} activeOpacity={1} onPress={() => setNivelModalVisible(false)}>
          <View style={styles.nivelCard}>
            <Text style={styles.nivelCardTitle}>Selecione o nível</Text>
            {NIVEIS.map((n) => (
              <TouchableOpacity key={n} style={styles.nivelOption} onPress={() => selectNivel(n)}>
                <Text style={[styles.nivelOptionText, form.nivel === n && styles.nivelOptionActive]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backBtn: { width: 38, height: 38, borderRadius: 6, borderWidth: 1, borderColor: "#ddd", alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#333", marginHorizontal: 8 },
  logo: { width: 44, height: 44, borderRadius: 6 },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ED5514",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  totalText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#333" },

  list: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  alunoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#ED5514",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
  alunoNome: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#333", flex: 1 },

  tabBar: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#eee" },
  tabItem: { width: 50, height: 50, backgroundColor: "#fff", borderRadius: 8, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5 },
  tabItemActive: { borderWidth: 2, borderColor: "#ED5514" },
  tabIcon: { width: 25 },

  // Modal novo aluno
  modalSafe: { flex: 1, backgroundColor: "#fff" },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#1a1a1a", textAlign: "center", paddingTop: 24, paddingBottom: 8 },
  modalContent: { padding: 20 },
  sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#ED5514", marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 6,
    padding: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#333",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  infoIcon: { marginLeft: 8 },

  nivelBtn: {
    backgroundColor: "#ED5514",
    borderRadius: 6,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  nivelBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#fff" },

  errosBox: { backgroundColor: "#fff3f3", borderRadius: 6, padding: 12, marginBottom: 10 },
  erroText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#E63946", marginBottom: 2 },

  saveBtn: { backgroundColor: "#ED5514", borderRadius: 6, padding: 16, alignItems: "center", marginTop: 8 },
  saveBtnText: { fontFamily: "Inter_600SemiBold", color: "#fff", fontSize: 15 },
  cancelBtn: { borderRadius: 6, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#eee", marginTop: 8 },
  cancelBtnText: { fontFamily: "Inter_600SemiBold", color: "#333", fontSize: 15 },

  // Modal nível
  nivelOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  nivelCard: { width: "80%", backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  nivelCardTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#1a1a1a", marginBottom: 16, textAlign: "center" },
  nivelOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#eee" },
  nivelOptionText: { fontFamily: "Inter_400Regular", fontSize: 15, color: "#333", textAlign: "center" },
  nivelOptionActive: { color: "#ED5514", fontFamily: "Inter_600SemiBold" },
});