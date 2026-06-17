import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const DAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

const EVENTS = [
  { id: 1, name: "Circuito TV Atalaia", date: "15.06.2026" },
  { id: 2, name: "Night Run Aracaju", date: "20.07.2026" },
  { id: 3, name: "2° Maratona de Aracaju", date: "31.10.2026" },
];

export default function HomeScreen() {
  const [selectedDay, setSelectedDay] = useState("QUA");

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

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <ImageBackground
          source={require("../../../assets/images/bannerpattern.png")}
          style={styles.banner}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Iniciante</Text>
          </View>
          <MaterialCommunityIcons
            name="run-fast"
            size={44}
            color="rgba(255,255,255,0.85)"
            style={styles.bannerIcon}
          />
        </ImageBackground>

        {/* Cronograma */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>CRONOGRAMA DE TREINOS</Text>
            <TouchableOpacity style={styles.editBtn}>
              <Feather name="edit-2" size={16} color="#ED5514" />
            </TouchableOpacity>
          </View>

          {/* Dias da semana */}
          <View style={styles.daysRow}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayBtn,
                  selectedDay === day && styles.dayBtnActive,
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text
                  style={[
                    styles.dayText,
                    selectedDay === day && styles.dayTextActive,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Treino do dia */}
          <View style={styles.workoutRow}>
            <View style={styles.workoutIconBox}>
              <MaterialCommunityIcons name="run" size={32} color="#ED5514" />
            </View>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutDesc}>5×100 desaquecimento</Text>
              <Text style={styles.workoutDesc}>2km na calma!</Text>
              <Text style={styles.workoutLevel}>Moderado</Text>
            </View>
          </View>
        </View>

        {/* Próximos Eventos */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>PRÓXIMOS EVENTOS</Text>
            <TouchableOpacity style={styles.editBtn}>
              <Feather name="plus" size={18} color="#ED5514" />
            </TouchableOpacity>
          </View>

          {EVENTS.map((event) => (
            <TouchableOpacity key={event.id} style={styles.eventRow}>
              <MaterialCommunityIcons
                name="medal-outline"
                size={20}
                color="#fff"
              />
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
          <Ionicons name="notifications-outline" size={26} color="#aaa" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, styles.tabItemActive]}>
          <Ionicons name="bar-chart-outline" size={26} color="#ED5514" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person-outline" size={26} color="#aaa" />
        </TouchableOpacity>
      </View>
    
      </SafeAreaView>
</ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundOverlay: {
  ...StyleSheet.absoluteFill,
  backgroundColor: "rgba(0, 0, 0, 0.2)", // 0.0 = transparente | 1.0 = preto total
},
  safe: {
    flex: 1,
  },
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
  logo: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },

  // Banner
  banner: {
    height: 80,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 6,
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(200, 80, 0, 0.35)",
  },

  levelBadge: {
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 30,
    paddingVertical: 1,
    backgroundColor: "#fff",
  },
  levelText: {
    color: "#ED5514",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  bannerIcon: {
    position: "absolute",
    right: 16,
    top: 16,
  },

  // Scroll
  scroll: {
    paddingBottom: 24,
  },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 6,
    margin: 16,
    marginBottom: 0,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
  editBtn: {
    width: 87,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },

  // Days
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dayBtn: {
    width: 42,
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  dayBtnActive: {
    backgroundColor: "#ED5514",
    borderColor: "#ED5514",
  },
  dayText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#555",
  },
  dayTextActive: {
    color: "#fff",
  },

  // Workout
  workoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  workoutIconBox: {
    width: 74,
    height: 74,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#ED5514",
    alignItems: "center",
    justifyContent: "center",
  },
  workoutInfo: {
    flex: 1,
  },
  workoutDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#333",
  },
  workoutLevel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#ED5514",
    marginTop: 4,
  },

  // Events
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ED5514",
    borderRadius: 6,
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },
  eventName: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#fff",
  },
  eventDateBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  eventDate: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#fff",
  },

  // Tab Bar
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingVertical: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  tabItemActive: {
    borderTopWidth: 2,
    borderTopColor: "#ED5514",
  },
});