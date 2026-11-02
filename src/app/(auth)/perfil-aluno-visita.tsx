import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { DAYS, useSchedule } from "../../context/ScheduleContext";
import type {
  Day,
  LevelKey,
  TrainingIconName,
  Workout,
} from "../../context/ScheduleContext";

const TRAINING_ICONS: { key: string; label: string; icon: TrainingIconName }[] = [
  { key: "run", label: "Corrida", icon: "run" },
  { key: "bike", label: "Ciclismo", icon: "bike" },
  { key: "swim", label: "Natação", icon: "swim" },
  { key: "walk", label: "Caminhada", icon: "walk" },
  { key: "weight", label: "Musculação", icon: "dumbbell" },
];

const NIVEL_LABEL: Record<string, string> = {
  sem_nivel: "Sem nível",
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export default function AlunoVisita() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, usuarios } = useAuth();
  const { setIndividualWorkout, clearIndividualWorkout, resolveWorkout } = useSchedule();

  const isProfessor = user?.isProfessor ?? false;
  const alunoId = String(id);
  const aluno = usuarios.find((u) => String(u._id) === alunoId);
  const nivelKey = (aluno?.nivel ?? "sem_nivel") as LevelKey;

  const [selectedDay, setSelectedDay] = useState<Day>("SEG");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Workout | null>(null);
  const [iconModalVisible, setIconModalVisible] = useState(false);

  const { workout: currentWorkout, source } = resolveWorkout(alunoId, nivelKey, selectedDay);
  const displayed = isEditing && draft ? draft : currentWorkout;

  const startEditing = () => {
    setDraft({ ...currentWorkout }); // parte do treino atual (do nível ou individual)
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setDraft(null);
  };

  const saveEditing = () => {
    if (!draft) return;
    setIndividualWorkout(alunoId, selectedDay, draft); // vira individual
    setIsEditing(false);
    setDraft(null);
  };

  const selectTrainingIcon = (iconName: TrainingIconName) => {
    setDraft((prev) => (prev ? { ...prev, icon: iconName } : prev));
    setIconModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pulsação Assessoria Esportiva</Text>
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

      {!aluno ? (
        <Text style={styles.emptyText}>Aluno não encontrado.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Foto de capa (sem edição) */}
          <View style={styles.coverBox}>
            <Image
              source={
                aluno.foto
                  ? { uri: aluno.foto }
                  : require("../../../assets/images/background.jpg")
              }
              style={styles.coverImage}
              resizeMode="cover"
            />
            <View style={styles.coverName}>
              <Text style={styles.coverNameText}>{aluno.nome}</Text>
            </View>
          </View>

          {isProfessor ? (
            /* Professor: cronograma editável do aluno */
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>CRONOGRAMA DE TREINO</Text>
                {isEditing ? (
                  <View style={styles.editActionsRow}>
                    <TouchableOpacity style={styles.iconActionBtn} onPress={cancelEditing}>
                      <Feather name="x" size={18} color="#E63946" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconActionBtn} onPress={saveEditing}>
                      <Feather name="check" size={18} color="#2A9D62" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.editBtn} onPress={startEditing}>
                    <Feather name="edit-2" size={16} color="#ED5514" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.daysRow}>
                {DAYS.map((day) => (
                  <TouchableOpacity
                    key={day}
                    disabled={isEditing}
                    style={[styles.dayBtn, selectedDay === day && styles.dayBtnActive]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text style={[styles.dayText, selectedDay === day && styles.dayTextActive]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.workoutRow}>
                <TouchableOpacity
                  style={styles.workoutIconBox}
                  onPress={() => isEditing && setIconModalVisible(true)}
                  activeOpacity={isEditing ? 0.7 : 1}
                >
                  <MaterialCommunityIcons name={displayed.icon} size={32} color="#ED5514" />
                </TouchableOpacity>
                <View style={styles.workoutInfo}>
                  {isEditing ? (
                    <TextInput
                      multiline
                      numberOfLines={3}
                      style={styles.workoutInput}
                      value={draft?.desc1 ?? ""}
                      onChangeText={(text) =>
                        setDraft((prev) => (prev ? { ...prev, desc1: text } : prev))
                      }
                      placeholder="Descrição do treino"
                      placeholderTextColor="#999"
                    />
                  ) : (
                    <Text style={styles.workoutDesc}>
                      {currentWorkout.desc1 || "Nenhum treino cadastrado"}
                    </Text>
                  )}
                </View>
              </View>

              <Text style={styles.sourceText}>
                {source === "individual"
                  ? "Treino individual (substitui o do nível)"
                  : "Treino do nível (padrão)"}
              </Text>

              {!isEditing && source === "individual" && (
                <TouchableOpacity onPress={() => clearIndividualWorkout(alunoId, selectedDay)}>
                  <Text style={styles.removeText}>Remover treino individual</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            /* Aluno visitante: somente leitura */
            <View style={styles.card}>
              <Text style={styles.nivelText}>
                Nível: {NIVEL_LABEL[aluno.nivel ?? "sem_nivel"]}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

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
        <Link href={isProfessor ? "/(auth)/perfilpro" : "/(auth)/perfil-aluno"} asChild>
          <TouchableOpacity style={styles.tabItem}>
            <Image
              source={require("../../../assets/images/perfil_icon.png")}
              style={styles.tabIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Modal ícone treino */}
      <Modal
        visible={iconModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIconModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIconModalVisible(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tipo de treino</Text>
            <View style={styles.modalIconsGrid}>
              {TRAINING_ICONS.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.modalIconItem}
                  onPress={() => selectTrainingIcon(item.icon)}
                >
                  <View style={styles.modalIconCircle}>
                    <MaterialCommunityIcons name={item.icon} size={28} color="#ED5514" />
                  </View>
                  <Text style={styles.modalIconLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f2f2f2" },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 30,
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
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
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
  scroll: { paddingBottom: 24 },

  coverBox: { marginTop: 16, position: "relative", paddingHorizontal: 16 },
  coverImage: { width: "100%", height: 418, alignSelf: "center", borderRadius: 6 },
  coverName: {
    position: "absolute",
    bottom: 30,
    left: 40,
    borderRadius: 6,
    backgroundColor: "rgba(0, 0, 0, 0.63)",
    paddingHorizontal: 15,
    paddingVertical: 6,
  },
  coverNameText: { fontFamily: "Inter_400Regular", fontSize: 16, color: "#fff" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 6,
    margin: 16,
    marginTop: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  nivelText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#333" },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#1a1a1a", letterSpacing: 0.5 },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  editActionsRow: { flexDirection: "row", gap: 8 },
  iconActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  daysRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  dayBtn: {
    width: 42,
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ED5514",
    alignItems: "center",
    justifyContent: "center",
  },
  dayBtnActive: { backgroundColor: "#ED5514", borderColor: "#ED5514" },
  dayText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#555" },
  dayTextActive: { color: "#fff" },
  workoutRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  workoutIconBox: {
    width: 74,
    height: 74,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#ED5514",
    alignItems: "center",
    justifyContent: "center",
  },
  workoutInfo: { flex: 1 },
  workoutDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#333" },
  workoutInput: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 4,
    marginBottom: 6,
  },
  sourceText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#ED5514",
    marginTop: 10,
  },
  removeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#E63946",
    marginTop: 8,
  },

  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingBottom: 34,
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  tabIcon: { width: 25 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: { width: "85%", backgroundColor: "#fff", borderRadius: 10, padding: 20 },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 16,
    textAlign: "center",
  },
  modalIconsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  modalIconItem: { width: "30%", alignItems: "center", marginBottom: 16 },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "#ED5514",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  modalIconLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#333",
    textAlign: "center",
  },
});