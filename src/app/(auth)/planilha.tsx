import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const DAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

const INITIAL_EVENTS = [
  { id: 1, name: "Circuito TV Atalaia", time: "", date: "15.06.2026", desc: "" },
  { id: 2, name: "Night Run Aracaju", time: "", date: "20.07.2026", desc: "" },
  { id: 3, name: "2° Maratona de Aracaju", time: "", date: "31.10.2026", desc: "" },
];

const TRAINING_ICONS = [
  { key: "run", label: "Corrida", icon: "run" },
  { key: "bike", label: "Ciclismo", icon: "bike" },
  { key: "swim", label: "Natação", icon: "swim" },
  { key: "walk", label: "Caminhada", icon: "walk" },
  { key: "weight", label: "Musculação", icon: "dumbbell" },
];

const LEVELS = [
  { key: "iniciante", label: "Iniciante", icon: require("../../../assets/images/iniciante_icon.png") },
  { key: "intermediario", label: "Intermediário", icon: require("../../../assets/images/intermediario_icon.png") },
  { key: "avancado", label: "Avançado", icon: require("../../../assets/images/avancado_icon.png") },
];

const buildEmptyWeek = () =>
  DAYS.reduce((acc, day) => {
    acc[day] = { icon: "run", desc1: "" };
    return acc;
  }, {});

const INITIAL_SCHEDULE = {
  iniciante: { ...buildEmptyWeek(), QUA: { icon: "run", desc1: "5×100 desaquecimento\n2km na calma!" } },
  intermediario: { ...buildEmptyWeek() },
  avancado: { ...buildEmptyWeek() },
};

const EMPTY_EVENT = { name: "", time: "", date: "", desc: "" };

export default function HomeScreen() {
  const [selectedDay, setSelectedDay] = useState("QUA");
  const [levelIndex, setLevelIndex] = useState(0);
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [iconModalVisible, setIconModalVisible] = useState(false);

  // Estados do modal de evento
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [eventDraft, setEventDraft] = useState(EMPTY_EVENT);
  const [editingEventId, setEditingEventId] = useState(null); // null = novo evento

  const currentLevel = LEVELS[levelIndex];
  const currentWorkout = schedule[currentLevel.key][selectedDay];
  const displayed = isEditing && draft ? draft : currentWorkout;

  const handleLevelPress = () => {
    if (isEditing) return;
    setLevelIndex((prev) => (prev + 1) % LEVELS.length);
  };

  const startEditing = () => {
    setDraft({ ...currentWorkout });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setDraft(null);
  };

  const saveEditing = () => {
    setSchedule((prev) => ({
      ...prev,
      [currentLevel.key]: {
        ...prev[currentLevel.key],
        [selectedDay]: draft,
      },
    }));
    setIsEditing(false);
    setDraft(null);
  };

  const selectTrainingIcon = (iconName) => {
    if (isEditing) {
      setDraft((prev) => ({ ...prev, icon: iconName }));
    } else {
      setSchedule((prev) => ({
        ...prev,
        [currentLevel.key]: {
          ...prev[currentLevel.key],
          [selectedDay]: { ...prev[currentLevel.key][selectedDay], icon: iconName },
        },
      }));
    }
    setIconModalVisible(false);
  };

  // Abre modal para novo evento
  const openNewEvent = () => {
    setEventDraft(EMPTY_EVENT);
    setEditingEventId(null);
    setEventModalVisible(true);
  };

  // Abre modal para editar evento existente
  const openEditEvent = (event) => {
    setEventDraft({ name: event.name, time: event.time, date: event.date, desc: event.desc });
    setEditingEventId(event.id);
    setEventModalVisible(true);
  };

  const saveEvent = () => {
    if (editingEventId === null) {
      // Novo evento
      setEvents((prev) => [
        ...prev,
        { id: Date.now(), ...eventDraft },
      ]);
    } else {
      // Editar existente
      setEvents((prev) =>
        prev.map((e) => (e.id === editingEventId ? { ...e, ...eventDraft } : e))
      );
    }
    setEventModalVisible(false);
  };

  const deleteEvent = () => {
    setEvents((prev) => prev.filter((e) => e.id !== editingEventId));
    setEventModalVisible(false);
  };

// Formata hora: "1230" -> "12:30"
function formatTime(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

// Formata data: "15062026" -> "15.06.2026"
function formatDate(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

  return (
    <ImageBackground
      source={require("../../../assets/images/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.backgroundOverlay} />
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
          {/* Banner */}
          <TouchableOpacity activeOpacity={0.85} onPress={handleLevelPress}>
            <ImageBackground
              source={require("../../../assets/images/bannerpattern.png")}
              style={styles.banner}
              imageStyle={styles.bannerImage}
              resizeMode="cover"
            >
              <View style={styles.overlay} />
              <View style={styles.bannerContent}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>{currentLevel.label}</Text>
                </View>
                <Image source={currentLevel.icon} style={styles.bannerIcon} resizeMode="contain" />
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Cronograma */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>CRONOGRAMA DE TREINOS</Text>
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
              <TouchableOpacity style={styles.workoutIconBox} onPress={() => setIconModalVisible(true)}>
                <MaterialCommunityIcons name={displayed.icon} size={32} color="#ED5514" />
              </TouchableOpacity>
              <View style={styles.workoutInfo}>
                {isEditing ? (
                  <TextInput
                    multiline
                    numberOfLines={3}
                    style={styles.workoutInput}
                    value={draft.desc1}
                    onChangeText={(text) => setDraft((prev) => ({ ...prev, desc1: text }))}
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
          </View>

          {/* Próximos Eventos */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>PRÓXIMOS EVENTOS</Text>
              <TouchableOpacity style={styles.editBtn} onPress={openNewEvent}>
                <Feather name="plus" size={18} color="#ED5514" />
              </TouchableOpacity>
            </View>

            {events.map((event) => (
              <TouchableOpacity key={event.id} style={styles.eventRow} onPress={() => openEditEvent(event)}>
                <MaterialCommunityIcons name="medal-outline" size={20} color="#fff" />
                <Text style={styles.eventName}>{event.name}</Text>
                <View style={styles.eventDateBox}>
                  <Text style={styles.eventDate}>{event.date}</Text>
                  <Feather name="calendar" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem}>
            <Image source={require("../../../assets/images/sino_icon.png")} style={styles.tabIcon} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabItem, styles.tabItemActive]}>
            <Image source={require("../../../assets/images/planilha_icon.png")} style={styles.tabIcon} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Image source={require("../../../assets/images/perfil_icon.png")} style={styles.tabIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Modal de seleção do tipo de treino */}
        <Modal visible={iconModalVisible} transparent animationType="fade" onRequestClose={() => setIconModalVisible(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIconModalVisible(false)}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Tipo de treino</Text>
              <View style={styles.modalIconsGrid}>
                {TRAINING_ICONS.map((item) => (
                  <TouchableOpacity key={item.key} style={styles.modalIconItem} onPress={() => selectTrainingIcon(item.icon)}>
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

        {/* Modal de novo/editar evento */}
        <Modal visible={eventModalVisible} transparent animationType="slide" onRequestClose={() => setEventModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.eventModalCard}>

              {/* Cabeçalho */}
              <View style={styles.eventModalHeader}>
                <Text style={styles.eventModalTitle}>
                  {editingEventId === null ? "NOVO EVENTO" : "EDITAR EVENTO"}
                </Text>
                <TouchableOpacity onPress={() => setEventModalVisible(false)}>
                  <Feather name="x" size={20} color="#E63946" />
                </TouchableOpacity>
              </View>

              {/* Nome */}
              <View style={styles.eventInputRow}>
                <MaterialCommunityIcons name="medal-outline" size={20} color="#ED5514" />
                <TextInput
                  style={styles.eventInput}
                  placeholder="Nome do evento..."
                  placeholderTextColor="#bbb"
                  value={eventDraft.name}
                  onChangeText={(text) => setEventDraft((prev) => ({ ...prev, name: text }))}
                />
              </View>

              {/* Hora e Data */}
              <View style={styles.eventRowInputs}>
                {/* Hora */}
                <TextInput
                  style={styles.eventInputBox}
                  placeholder="--:--"
                  placeholderTextColor="#bbb"
                  value={eventDraft.time}
                  onChangeText={(text) =>
                    setEventDraft((prev) => ({ ...prev, time: formatTime(text) }))
                  }
                  keyboardType="numeric"
                  maxLength={5}
                />

                {/* Data */}
                <View style={styles.eventDateInput}>
                  <Feather name="calendar" size={16} color="#bbb" />
                  <TextInput
                    style={styles.eventDateText}
                    placeholder="--.--.----"
                    placeholderTextColor="#bbb"
                    value={eventDraft.date}
                    onChangeText={(text) =>
                      setEventDraft((prev) => ({ ...prev, date: formatDate(text) }))
                    }
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
              </View>

              {/* Descrição */}
              <TextInput
                style={styles.eventDescInput}
                placeholder="Adicione uma descrição (ex.: categorias de 5km e 10km...)"
                placeholderTextColor="#bbb"
                value={eventDraft.desc}
                onChangeText={(text) => setEventDraft((prev) => ({ ...prev, desc: text }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Salvar */}
              <TouchableOpacity style={styles.saveBtn} onPress={saveEvent}>
                <Text style={styles.saveBtnText}>Salvar</Text>
              </TouchableOpacity>

              {/* Cancelar ou Excluir */}
              {editingEventId === null ? (
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEventModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.deleteBtn} onPress={deleteEvent}>
                  <Text style={styles.deleteBtnText}>Excluir</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  backgroundOverlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.2)" },
  safe: { flex: 1 },

  header: {
    marginTop: 20, height: 50, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", backgroundColor: "#fff",
    paddingHorizontal: 7, paddingVertical: 1, marginHorizontal: 16, borderRadius: 6,
  },
  backBtn: { width: 38, height: 38, borderRadius: 6, borderWidth: 1, borderColor: "#ddd", alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#333", marginHorizontal: 8 },
  logo: { width: 47, height: 47, borderRadius: 6 },

  banner: { height: 90, marginHorizontal: 16, marginTop: 12, borderRadius: 6, overflow: "hidden" },
  bannerImage: { width: "100%", height: "100%", borderRadius: 6 },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(200,80,0,0.35)" },
  bannerContent: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  levelBadge: { alignSelf: "center", borderWidth: 2, borderColor: "#fff", borderRadius: 6, marginTop: 30, paddingHorizontal: 20, paddingVertical: 2, backgroundColor: "#fff" },
  levelText: { color: "#ED5514", fontFamily: "Inter_600SemiBold", fontSize: 12 },
  bannerIcon: { height: 50 },

  scroll: { paddingBottom: 24 },

  card: { backgroundColor: "#fff", borderRadius: 6, marginTop: 10, margin: 16, marginBottom: 0, padding: 16, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#1a1a1a", letterSpacing: 0.5 },
  editBtn: { width: 40, height: 40, borderRadius: 6, borderWidth: 1, borderColor: "#eee", alignItems: "center", justifyContent: "center" },
  editActionsRow: { flexDirection: "row", gap: 8 },
  iconActionBtn: { width: 40, height: 40, borderRadius: 6, borderWidth: 1, borderColor: "#eee", alignItems: "center", justifyContent: "center" },

  daysRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  dayBtn: { width: 42, height: 44, borderRadius: 6, borderWidth: 1, borderColor: "#ED5514", alignItems: "center", justifyContent: "center" },
  dayBtnActive: { backgroundColor: "#ED5514", borderColor: "#ED5514" },
  dayText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#555" },
  dayTextActive: { color: "#fff" },

  workoutRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  workoutIconBox: { width: 74, height: 74, borderRadius: 6, borderWidth: 1.5, borderColor: "#ED5514", alignItems: "center", justifyContent: "center" },
  workoutInfo: { flex: 1 },
  workoutDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#333" },
  workoutInput: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#333", borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 4, marginBottom: 6 },

  eventRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#ED5514", borderRadius: 6, padding: 14, marginBottom: 8, gap: 10 },
  eventName: { flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#fff" },
  eventDateBox: { flexDirection: "row", alignItems: "center", gap: 4 },
  eventDate: { fontFamily: "Inter_500Medium", fontSize: 13, color: "#fff" },

  tabBar: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, backgroundColor: "#fff" },
  tabItem: { width: 50, height: 50, backgroundColor: "#fff", borderRadius: 8, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5 },
  tabItemActive: { borderWidth: 2, borderColor: "#ED5514" },
  tabIcon: { width: 25 },

  // Modal ícone treino
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  modalCard: { width: "85%", backgroundColor: "#fff", borderRadius: 10, padding: 20 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#1a1a1a", marginBottom: 16, textAlign: "center" },
  modalIconsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  modalIconItem: { width: "30%", alignItems: "center", marginBottom: 16 },
  modalIconCircle: { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, borderColor: "#ED5514", alignItems: "center", justifyContent: "center", marginBottom: 6 },
  modalIconLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: "#333", textAlign: "center" },

  // Modal evento
  eventModalCard: { width: "90%", backgroundColor: "#fff", borderRadius: 12, padding: 20, gap: 12 },
  eventModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  eventModalTitle: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#1a1a1a", letterSpacing: 0.5 },
  eventInputRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#eee", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  eventInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: "#333" },
  eventRowInputs: { flexDirection: "row", gap: 10 },
  eventInputBox: { width: "100%", flex: 1, borderWidth: 1, borderColor: "#eee", borderRadius: 8, paddingHorizontal: 5, paddingVertical: 10, fontFamily: "Inter_400Regular", fontSize: 14, color: "#333", textAlign: "center" },
  eventDateInput: { flex: 1, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#eee", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, gap: 6, overflow: "hidden" },
  eventDateText: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#333" , maxWidth: 100},
  eventDescInput: { borderWidth: 1, borderColor: "#eee", borderRadius: 8, padding: 12, fontFamily: "Inter_400Regular", fontSize: 14, color: "#333", minHeight: 100 },
  saveBtn: { backgroundColor: "#ED5514", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 4 },
  saveBtnText: { fontFamily: "Inter_600SemiBold", color: "#fff", fontSize: 15 },
  cancelBtn: { borderRadius: 8, padding: 14, alignItems: "center" },
  cancelBtnText: { fontFamily: "Inter_600SemiBold", color: "#333", fontSize: 15 },
  deleteBtn: { borderRadius: 8, padding: 14, alignItems: "center" },
  deleteBtnText: { fontFamily: "Inter_600SemiBold", color: "#E63946", fontSize: 15 },
});