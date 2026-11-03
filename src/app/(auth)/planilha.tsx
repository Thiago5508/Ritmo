import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

type TrainingIconName =
  React.ComponentProps<typeof MaterialCommunityIcons>["name"];

type Day = "SEG" | "TER" | "QUA" | "QUI" | "SEX" | "SAB" | "DOM";

type Nivel = "iniciante" | "intermediario" | "avancado";

type LevelKey = Nivel;

type Workout = {
  icon: TrainingIconName;
  desc1: string;
};

type RoutineWorkout = {
  icon: TrainingIconName;
  descricao: string;
};

type Routine = {
  _id: string;
  empresaId: string;
  nivel: Nivel;
  diasSemana: Day[];
  treinos?: Partial<Record<Day, RoutineWorkout>>;
};

type EventDraft = {
  time: string;
  date: string;
  local: string;
  desc: string;
};

type TrainingEvent = {
  _id: string;
  data: string;
  hora: string;
  local: string;
  descricao: string;
};

const DAYS: Day[] = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

const TRAINING_ICONS: {
  key: string;
  label: string;
  icon: TrainingIconName;
}[] = [
  { key: "run", label: "Corrida", icon: "run" },
  { key: "bike", label: "Ciclismo", icon: "bike" },
  { key: "swim", label: "Natação", icon: "swim" },
  { key: "walk", label: "Caminhada", icon: "walk" },
  { key: "weight", label: "Musculação", icon: "dumbbell" },
];

const LEVELS: {
  key: LevelKey;
  label: string;
  icon: number;
}[] = [
  {
    key: "iniciante",
    label: "Iniciante",
    icon: require("../../../assets/images/iniciante_icon.png"),
  },
  {
    key: "intermediario",
    label: "Intermediário",
    icon: require("../../../assets/images/intermediario_icon.png"),
  },
  {
    key: "avancado",
    label: "Avançado",
    icon: require("../../../assets/images/avancado_icon.png"),
  },
];

const EMPTY_WORKOUT: Workout = {
  icon: "run",
  desc1: "",
};

const EMPTY_EVENT: EventDraft = {
  time: "",
  date: "",
  local: "",
  desc: "",
};

function formatTime(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) return digits;

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function formatDate(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) return digits;

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

// Converte DD.MM.AAAA para AAAA-MM-DD e valida a data.
function dateToApi(text: string): string | null {
  const match = text.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

  if (!match) return null;

  const [, dia, mes, ano] = match;

  const date = new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia)
  );

  if (
    date.getFullYear() !== Number(ano) ||
    date.getMonth() !== Number(mes) - 1 ||
    date.getDate() !== Number(dia)
  ) {
    return null;
  }

  return `${ano}-${mes}-${dia}`;
}

// Converte AAAA-MM-DD recebido do backend para DD.MM.AAAA.
function formatApiDate(data: string): string {
  if (!data) return "";

  const [ano, mes, dia] = data.split("-");

  if (!ano || !mes || !dia) return data;

  return `${dia}.${mes}.${ano}`;
}

// Converte o formato recebido do backend para o formato usado na tela.
function converterTreino(treino?: RoutineWorkout): Workout {
  if (!treino) {
    return { ...EMPTY_WORKOUT };
  }

  const iconValido = TRAINING_ICONS.some(
    (item) => item.icon === treino.icon
  );

  return {
    icon: iconValido ? treino.icon : "run",
    desc1: treino.descricao ?? "",
  };
}

export default function PlanilhaScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const isProfessor = user?.isProfessor ?? false;
  const nivelAluno = user?.nivel ?? "iniciante";
  const nomeAluno = user?.nome ?? "";

  const initialLevelIndex = isProfessor
    ? 0
    : Math.max(
        0,
        LEVELS.findIndex((level) => level.key === nivelAluno)
      );

  const [selectedDay, setSelectedDay] = useState<Day>("QUA");
  const [levelIndex, setLevelIndex] = useState(initialLevelIndex);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Workout | null>(null);
  const [draftDay, setDraftDay] = useState<Day | null>(null);

  const [iconModalVisible, setIconModalVisible] = useState(false);

  // Eventos
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);

  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [eventDraft, setEventDraft] = useState<EventDraft>(EMPTY_EVENT);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Rotinas
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loadingRoutine, setLoadingRoutine] = useState(false);
  const [savingRoutine, setSavingRoutine] = useState(false);

  const currentLevel = LEVELS[levelIndex] ?? LEVELS[0];

  // Localiza a rotina correspondente ao nível selecionado.
  const currentRoutine = routines.find(
    (routine) => routine.nivel === currentLevel.key
  );

  // Os dias ativos vêm diretamente do backend.
  const activeDays = currentRoutine?.diasSemana ?? [];

  // O conteúdo do treino também vem diretamente do backend.
  const currentWorkout = converterTreino(
    currentRoutine?.treinos?.[selectedDay]
  );

  const displayed =
    isEditing && draft ? draft : currentWorkout;

  // =========================================================
  // CARREGAR ROTINAS
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const carregarRotinas = async () => {
      try {
        setLoadingRoutine(true);

        const token = await SecureStore.getItemAsync("auth_token");

        if (!token) {
          Alert.alert(
            "Sessão expirada",
            "Faça login novamente para continuar."
          );
          return;
        }

        const endpoint = isProfessor
          ? `${API_URL}/routines`
          : `${API_URL}/routines/minha-rotina`;

        console.log("========== BUSCANDO ROTINAS ==========");
        console.log("Usuário é professor:", isProfessor);
        console.log("Nível do usuário:", nivelAluno);
        console.log("URL:", endpoint);

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const responseText = await response.text();

        console.log("Status:", response.status);
        console.log("Resposta bruta:", responseText);

        if (response.status === 404 && !isProfessor) {
          if (mounted) {
            setRoutines([]);
          }
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Erro ${response.status}: ${
              responseText || "Falha ao carregar rotinas."
            }`
          );
        }

        const data = responseText ? JSON.parse(responseText) : null;

        let rotinasRecebidas: Routine[] = [];

        if (isProfessor) {
          rotinasRecebidas = Array.isArray(data)
            ? data
            : data?.rotinas ?? [];
        } else {
          const rotina = data?.rotina ?? data;

          rotinasRecebidas = rotina ? [rotina] : [];
        }

        console.log("========== ROTINAS RECEBIDAS ==========");
        console.log(
          JSON.stringify(rotinasRecebidas, null, 2)
        );

        if (mounted) {
          setRoutines(rotinasRecebidas);
        }
      } catch (error) {
        console.error("Erro ao carregar rotinas:", error);

        if (mounted) {
          Alert.alert(
            "Erro",
            error instanceof Error
              ? error.message
              : "Não foi possível carregar as rotinas."
          );
        }
      } finally {
        if (mounted) {
          setLoadingRoutine(false);
        }
      }
    };

    carregarRotinas();

    return () => {
      mounted = false;
    };
  }, [isProfessor, nivelAluno]);

  // =========================================================
  // CARREGAR EVENTOS
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const carregarEventos = async () => {
      try {
        setLoadingEvents(true);

        const token = await SecureStore.getItemAsync("auth_token");

        if (!token) {
          Alert.alert(
            "Sessão expirada",
            "Faça login novamente para continuar."
          );
          return;
        }

        const response = await fetch(`${API_URL}/events`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const responseText = await response.text();

        console.log("========== BUSCANDO EVENTOS ==========");
        console.log("Status:", response.status);
        console.log("Resposta:", responseText);

        if (!response.ok) {
          throw new Error(
            `Erro ${response.status}: ${
              responseText || "Não foi possível carregar os eventos."
            }`
          );
        }

        const data = responseText ? JSON.parse(responseText) : null;

        const eventosRecebidos: TrainingEvent[] = Array.isArray(data)
          ? data
          : data?.eventos ?? [];

        // Ordena os eventos por data e horário.
        const eventosOrdenados = [...eventosRecebidos].sort((a, b) => {
          const dataA = `${a.data} ${a.hora}`;
          const dataB = `${b.data} ${b.hora}`;

          return dataA.localeCompare(dataB);
        });

        if (mounted) {
          setEvents(eventosOrdenados);
        }
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);

        if (mounted) {
          Alert.alert(
            "Erro",
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os eventos."
          );
        }
      } finally {
        if (mounted) {
          setLoadingEvents(false);
        }
      }
    };

    carregarEventos();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // AJUSTAR DIA SELECIONADO
  // =========================================================

  useEffect(() => {
    if (loadingRoutine || isEditing) return;

    if (
      activeDays.length > 0 &&
      !activeDays.includes(selectedDay)
    ) {
      setSelectedDay(activeDays[0]);
    }
  }, [activeDays, selectedDay, loadingRoutine, isEditing]);

  // =========================================================
  // TROCAR NÍVEL
  // =========================================================

  const handleLevelPress = () => {
    if (!isProfessor || isEditing) return;

    setLevelIndex((previous) => {
      return (previous + 1) % LEVELS.length;
    });

    setSelectedDay("SEG");
  };

  // =========================================================
  // INICIAR E CANCELAR EDIÇÃO
  // =========================================================

  const startEditing = () => {
    const diaInicial =
      activeDays.length > 0
        ? selectedDay
        : "SEG";

    setSelectedDay(diaInicial);
    setDraftDay(diaInicial);

    setDraft(
      converterTreino(currentRoutine?.treinos?.[diaInicial])
    );

    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setDraft(null);
    setDraftDay(null);
    setIconModalVisible(false);
  };

  // =========================================================
  // SELECIONAR DIA PARA EDITAR
  // =========================================================

  const selectDraftDay = (day: Day) => {
    if (!isEditing) return;

    setDraftDay(day);

    const treinoSalvo = currentRoutine?.treinos?.[day];

    setDraft(converterTreino(treinoSalvo));
  };

  // =========================================================
  // SALVAR ROTINA E TREINO NO BACKEND
  // =========================================================

  const saveEditing = async () => {
    if (!draft || !draftDay) {
      Alert.alert("Atenção", "Selecione um dia da semana.");
      return;
    }

    if (!draft.desc1.trim()) {
      Alert.alert(
        "Atenção",
        "Informe a descrição do treino antes de salvar."
      );
      return;
    }

    try {
      setSavingRoutine(true);

      const token = await SecureStore.getItemAsync("auth_token");

      if (!token) {
        Alert.alert(
          "Sessão expirada",
          "Faça login novamente para continuar."
        );
        return;
      }

      const nivel = currentLevel.key;

      const rotinaExistente = routines.find(
        (routine) => routine.nivel === nivel
      );

      // Mantém todos os dias já cadastrados.
      const diasAtualizados: Day[] = rotinaExistente
        ? rotinaExistente.diasSemana.includes(draftDay)
          ? [...rotinaExistente.diasSemana]
          : [...rotinaExistente.diasSemana, draftDay]
        : [draftDay];

      // Preserva os treinos anteriores e altera somente o dia editado.
      const treinosAtualizados: Partial<
        Record<Day, RoutineWorkout>
      > = {
        ...(rotinaExistente?.treinos ?? {}),
        [draftDay]: {
          icon: draft.icon,
          descricao: draft.desc1.trim(),
        },
      };

      const endpoint = rotinaExistente
        ? `${API_URL}/routines/${rotinaExistente._id}`
        : `${API_URL}/routines`;

      const metodo = rotinaExistente ? "PUT" : "POST";

      const body = rotinaExistente
        ? {
            diasSemana: diasAtualizados,
            treinos: treinosAtualizados,
          }
        : {
            nivel,
            diasSemana: diasAtualizados,
            treinos: treinosAtualizados,
          };

      console.log("========== SALVANDO ROTINA ==========");
      console.log("Método:", metodo);
      console.log("Endpoint:", endpoint);
      console.log("Dados enviados:", JSON.stringify(body, null, 2));

      const response = await fetch(endpoint, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const responseText = await response.text();

      console.log("Status do salvamento:", response.status);
      console.log("Resposta do salvamento:", responseText);

      if (!response.ok) {
        throw new Error(
          `Erro ${response.status}: ${
            responseText || "Não foi possível salvar a rotina."
          }`
        );
      }

      const data = responseText ? JSON.parse(responseText) : null;

      const rotinaSalva: Routine = data?.rotina ?? data;

      if (!rotinaSalva?._id) {
        throw new Error(
          "A API não retornou a rotina salva corretamente."
        );
      }

      // Atualiza a rotina no estado com os dados retornados pelo banco.
      setRoutines((previous) => {
        const outrasRotinas = previous.filter(
          (routine) => routine.nivel !== nivel
        );

        return [...outrasRotinas, rotinaSalva];
      });

      setSelectedDay(draftDay);
      setIsEditing(false);
      setDraft(null);
      setDraftDay(null);
      setIconModalVisible(false);

      Alert.alert(
        "Sucesso",
        `Treino de ${draftDay} salvo no banco de dados!`
      );
    } catch (error) {
      console.error("Erro ao salvar rotina:", error);

      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a rotina."
      );
    } finally {
      setSavingRoutine(false);
    }
  };

  // =========================================================
  // SELECIONAR ÍCONE
  // =========================================================

  const selectTrainingIcon = (iconName: TrainingIconName) => {
    if (!isEditing) return;

    setDraft((previous) =>
      previous
        ? {
            ...previous,
            icon: iconName,
          }
        : previous
    );

    setIconModalVisible(false);
  };

  // =========================================================
  // EVENTOS
  // =========================================================

  const openNewEvent = () => {
    setEventDraft(EMPTY_EVENT);
    setEditingEventId(null);
    setEventModalVisible(true);
  };

  const openEditEvent = (event: TrainingEvent) => {
    setEventDraft({
      local: event.local ?? "",
      time: event.hora ?? "",
      date: formatApiDate(event.data),
      desc: event.descricao ?? "",
    });

    setEditingEventId(event._id);
    setEventModalVisible(true);
  };

  const saveEvent = async () => {
    if (!eventDraft.local.trim()) {
      Alert.alert("Atenção", "Informe o local do evento.");
      return;
    }

    const dataFormatada = dateToApi(eventDraft.date);

    if (!dataFormatada) {
      Alert.alert(
        "Atenção",
        "Informe uma data válida no formato DD.MM.AAAA."
      );
      return;
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(eventDraft.time)) {
      Alert.alert(
        "Atenção",
        "Informe um horário válido no formato HH:mm."
      );
      return;
    }

    if (!eventDraft.desc.trim()) {
      Alert.alert(
        "Atenção",
        "Informe uma descrição para o evento."
      );
      return;
    }

    try {
      setSavingEvent(true);

      const token = await SecureStore.getItemAsync("auth_token");

      if (!token) {
        Alert.alert(
          "Sessão expirada",
          "Faça login novamente para continuar."
        );
        return;
      }

      const body = {
        data: dataFormatada,
        hora: eventDraft.time,
        local: eventDraft.local.trim(),
        descricao: eventDraft.desc.trim(),
      };

      const endpoint =
        editingEventId === null
          ? `${API_URL}/events`
          : `${API_URL}/events/${editingEventId}`;

      const metodo = editingEventId === null ? "POST" : "PUT";

      console.log("========== SALVANDO EVENTO ==========");
      console.log("Método:", metodo);
      console.log("Endpoint:", endpoint);
      console.log("Dados enviados:", JSON.stringify(body, null, 2));

      const response = await fetch(endpoint, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const responseText = await response.text();

      console.log("Status:", response.status);
      console.log("Resposta:", responseText);

      if (!response.ok) {
        throw new Error(
          `Erro ${response.status}: ${
            responseText || "Não foi possível salvar o evento."
          }`
        );
      }

      const data = responseText ? JSON.parse(responseText) : null;
      const eventoSalvo: TrainingEvent = data?.evento ?? data;

      if (!eventoSalvo?._id) {
        throw new Error(
          "A API não retornou o evento salvo corretamente."
        );
      }

      setEvents((previous) => {
        let eventosAtualizados: TrainingEvent[];

        if (editingEventId === null) {
          eventosAtualizados = [...previous, eventoSalvo];
        } else {
          eventosAtualizados = previous.map((event) =>
            event._id === editingEventId ? eventoSalvo : event
          );
        }

        return eventosAtualizados.sort((a, b) => {
          const dataA = `${a.data} ${a.hora}`;
          const dataB = `${b.data} ${b.hora}`;

          return dataA.localeCompare(dataB);
        });
      });

      setEventModalVisible(false);
      setEventDraft(EMPTY_EVENT);
      setEditingEventId(null);

      Alert.alert(
        "Sucesso",
        editingEventId === null
          ? "Evento cadastrado com sucesso!"
          : "Evento atualizado com sucesso!"
      );
    } catch (error) {
      console.error("Erro ao salvar evento:", error);

      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o evento."
      );
    } finally {
      setSavingEvent(false);
    }
  };

  const deleteEvent = async () => {
    if (!editingEventId) return;

    try {
      setSavingEvent(true);

      const token = await SecureStore.getItemAsync("auth_token");

      if (!token) {
        Alert.alert(
          "Sessão expirada",
          "Faça login novamente para continuar."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/events/${editingEventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseText = await response.text();

      console.log("========== EXCLUINDO EVENTO ==========");
      console.log("Status:", response.status);
      console.log("Resposta:", responseText);

      if (!response.ok) {
        throw new Error(
          `Erro ${response.status}: ${
            responseText || "Não foi possível excluir o evento."
          }`
        );
      }

      setEvents((previous) =>
        previous.filter((event) => event._id !== editingEventId)
      );

      setEventModalVisible(false);
      setEventDraft(EMPTY_EVENT);
      setEditingEventId(null);

      Alert.alert("Sucesso", "Evento excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir evento:", error);

      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o evento."
      );
    } finally {
      setSavingEvent(false);
    }
  };

  // =========================================================
  // TELA
  // =========================================================

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
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              logout();
              router.replace("/login");
            }}
          >
            <Image
              source={require("../../../assets/images/exit_icon.png")}
              style={styles.tabIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Pulsação Assessoria Esportiva
          </Text>

          {isProfessor ? (
            <Link href="/(auth)/alunos" asChild>
              <TouchableOpacity>
                <Image
                  source={require("../../../assets/images/logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </Link>
          ) : (
            <Image
              source={require("../../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner */}
          <TouchableOpacity
            activeOpacity={isProfessor ? 0.85 : 1}
            onPress={handleLevelPress}
          >
            <ImageBackground
              source={require("../../../assets/images/bannerpattern.png")}
              style={styles.banner}
              imageStyle={styles.bannerImage}
              resizeMode="cover"
            >
              <View style={styles.overlay} />

              <View style={styles.bannerContent}>
                <View>
                  {!isProfessor && (
                    <Text style={styles.bannerNome}>
                      {nomeAluno}
                    </Text>
                  )}

                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>
                      {currentLevel.label}
                    </Text>
                  </View>
                </View>

                <Image
                  source={currentLevel.icon}
                  style={styles.bannerIcon}
                  resizeMode="contain"
                />
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Cronograma */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                CRONOGRAMA DE TREINOS
              </Text>

              {isProfessor &&
                (isEditing ? (
                  <View style={styles.editActionsRow}>
                    <TouchableOpacity
                      style={styles.iconActionBtn}
                      onPress={cancelEditing}
                      disabled={savingRoutine}
                    >
                      <Feather
                        name="x"
                        size={18}
                        color="#E63946"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.iconActionBtn}
                      onPress={saveEditing}
                      disabled={savingRoutine}
                    >
                      <Feather
                        name="check"
                        size={18}
                        color="#2A9D62"
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={startEditing}
                    disabled={loadingRoutine || savingRoutine}
                  >
                    <Feather
                      name="edit-2"
                      size={16}
                      color="#ED5514"
                    />
                  </TouchableOpacity>
                ))}
            </View>

            {/* Dias da semana */}
            <View style={styles.daysRow}>
              {DAYS.map((day) => {
                const dayIsActive = activeDays.includes(day);

                const dayIsSelected = isEditing
                  ? draftDay === day
                  : selectedDay === day && dayIsActive;

                return (
                  <TouchableOpacity
                    key={day}
                    disabled={
                      loadingRoutine ||
                      savingRoutine ||
                      (!isEditing && !dayIsActive)
                    }
                    style={[
                      styles.dayBtn,
                      dayIsActive && styles.dayBtnScheduled,
                      dayIsSelected && styles.dayBtnActive,
                      !dayIsActive &&
                        !dayIsSelected &&
                        styles.dayBtnDisabled,
                    ]}
                    onPress={() => {
                      if (isEditing && isProfessor) {
                        selectDraftDay(day);
                      } else if (dayIsActive) {
                        setSelectedDay(day);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        dayIsActive && styles.dayTextScheduled,
                        dayIsSelected && styles.dayTextActive,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {loadingRoutine ? (
              <Text style={styles.routineMessage}>
                Carregando rotina...
              </Text>
            ) : activeDays.length === 0 && !isEditing ? (
              <Text style={styles.routineMessage}>
                Nenhum dia de treino cadastrado para esta rotina.
              </Text>
            ) : isEditing ? (
              <Text style={styles.routineHint}>
                Selecione um dia para cadastrar ou editar o treino.
              </Text>
            ) : null}

            {/* Treino */}
            <View style={styles.workoutRow}>
              <TouchableOpacity
                style={styles.workoutIconBox}
                onPress={() => {
                  if (isProfessor && isEditing) {
                    setIconModalVisible(true);
                  }
                }}
                activeOpacity={
                  isProfessor && isEditing ? 0.7 : 1
                }
                disabled={!isProfessor || !isEditing || savingRoutine}
              >
                <MaterialCommunityIcons
                  name={displayed.icon}
                  size={32}
                  color="#ED5514"
                />
              </TouchableOpacity>

              <View style={styles.workoutInfo}>
                {isProfessor && isEditing ? (
                  <TextInput
                    multiline
                    numberOfLines={3}
                    style={styles.workoutInput}
                    value={draft?.desc1 ?? ""}
                    onChangeText={(text) =>
                      setDraft((previous) =>
                        previous
                          ? { ...previous, desc1: text }
                          : previous
                      )
                    }
                    placeholder="Descrição do treino"
                    placeholderTextColor="#999"
                    editable={!savingRoutine}
                  />
                ) : (
                  <Text style={styles.workoutDesc}>
                    {displayed.desc1 || "Nenhum treino cadastrado"}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Próximos Eventos */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                PRÓXIMOS EVENTOS
              </Text>

              {isProfessor && (
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={openNewEvent}
                  disabled={savingEvent}
                >
                  <Feather
                    name="plus"
                    size={18}
                    color="#ED5514"
                  />
                </TouchableOpacity>
              )}
            </View>

            {loadingEvents ? (
              <Text style={styles.eventEmptyMessage}>
                Carregando eventos...
              </Text>
            ) : events.length === 0 ? (
              <Text style={styles.eventEmptyMessage}>
                Nenhum evento cadastrado no momento.
              </Text>
            ) : (
              events.map((event) => (
                <TouchableOpacity
                  key={event._id}
                  style={styles.eventRow}
                  onPress={() =>
                    isProfessor && openEditEvent(event)
                  }
                  activeOpacity={isProfessor ? 0.7 : 1}
                >
                  <MaterialCommunityIcons
                    name="medal-outline"
                    size={20}
                    color="#fff"
                  />

                  <View style={styles.eventInfo}>
                    <Text style={styles.eventName}>
                      {event.descricao}
                    </Text>

                    <Text style={styles.eventMeta}>
                      {event.local} • {event.hora}
                    </Text>
                  </View>

                  <View style={styles.eventDateBox}>
                    <Text style={styles.eventDate}>
                      {formatApiDate(event.data)}
                    </Text>

                    <Feather
                      name="calendar"
                      size={14}
                      color="#fff"
                    />
                  </View>
                </TouchableOpacity>
              ))
            )}
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

          <TouchableOpacity
            style={[styles.tabItem, styles.tabItemActive]}
          >
            <Image
              source={require("../../../assets/images/planilha_icon.png")}
              style={styles.tabIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Link
            href={
              isProfessor
                ? "/(auth)/perfilpro"
                : "/(auth)/perfil-aluno"
            }
            asChild
          >
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
              <Text style={styles.modalTitle}>
                Tipo de treino
              </Text>

              <View style={styles.modalIconsGrid}>
                {TRAINING_ICONS.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.modalIconItem}
                    onPress={() =>
                      selectTrainingIcon(item.icon)
                    }
                  >
                    <View style={styles.modalIconCircle}>
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={28}
                        color="#ED5514"
                      />
                    </View>

                    <Text style={styles.modalIconLabel}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal evento */}
        <Modal
          visible={eventModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => {
            if (!savingEvent) {
              setEventModalVisible(false);
            }
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.eventModalCard}>
              <View style={styles.eventModalHeader}>
                <Text style={styles.eventModalTitle}>
                  {editingEventId === null
                    ? "NOVO EVENTO"
                    : "EDITAR EVENTO"}
                </Text>

                <TouchableOpacity
                  onPress={() => setEventModalVisible(false)}
                  disabled={savingEvent}
                >
                  <Feather
                    name="x"
                    size={20}
                    color="#E63946"
                  />
                </TouchableOpacity>
              </View>

              {/* Local do evento */}
              <View style={styles.eventInputRow}>
                <Feather
                  name="map-pin"
                  size={20}
                  color="#ED5514"
                />

                <TextInput
                  style={styles.eventInput}
                  placeholder="Local do evento..."
                  placeholderTextColor="#bbb"
                  value={eventDraft.local}
                  onChangeText={(text) =>
                    setEventDraft((previous) => ({
                      ...previous,
                      local: text,
                    }))
                  }
                  editable={!savingEvent}
                />
              </View>

              {/* Horário e data */}
              <View style={styles.eventRowInputs}>
                <TextInput
                  style={styles.eventInputBox}
                  placeholder="--:--"
                  placeholderTextColor="#bbb"
                  value={eventDraft.time}
                  onChangeText={(text) =>
                    setEventDraft((previous) => ({
                      ...previous,
                      time: formatTime(text),
                    }))
                  }
                  keyboardType="numeric"
                  maxLength={5}
                  editable={!savingEvent}
                />

                <View style={styles.eventDateInput}>
                  <Feather
                    name="calendar"
                    size={16}
                    color="#bbb"
                  />

                  <TextInput
                    style={styles.eventDateText}
                    placeholder="--.--.----"
                    placeholderTextColor="#bbb"
                    value={eventDraft.date}
                    onChangeText={(text) =>
                      setEventDraft((previous) => ({
                        ...previous,
                        date: formatDate(text),
                      }))
                    }
                    keyboardType="numeric"
                    maxLength={10}
                    editable={!savingEvent}
                  />
                </View>
              </View>

              {/* Descrição */}
              <TextInput
                style={styles.eventDescInput}
                placeholder="Adicione uma descrição..."
                placeholderTextColor="#bbb"
                value={eventDraft.desc}
                onChangeText={(text) =>
                  setEventDraft((previous) => ({
                    ...previous,
                    desc: text,
                  }))
                }
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!savingEvent}
              />

              {/* Salvar */}
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={saveEvent}
                disabled={savingEvent}
              >
                <Text style={styles.saveBtnText}>
                  {savingEvent ? "Salvando..." : "Salvar"}
                </Text>
              </TouchableOpacity>

              {editingEventId === null ? (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setEventModalVisible(false)}
                  disabled={savingEvent}
                >
                  <Text style={styles.cancelBtnText}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={deleteEvent}
                  disabled={savingEvent}
                >
                  <Text style={styles.deleteBtnText}>
                    {savingEvent ? "Aguarde..." : "Excluir"}
                  </Text>
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
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  backgroundOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  safe: {
    flex: 1,
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

  logo: {
    width: 47,
    height: 47,
    borderRadius: 6,
  },

  banner: {
    height: 90,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 6,
    overflow: "hidden",
  },

  bannerImage: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(200,80,0,0.35)",
  },

  bannerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  bannerNome: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
  },

  levelBadge: {
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 2,
    backgroundColor: "#fff",
  },

  levelText: {
    color: "#ED5514",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },

  bannerIcon: {
    height: 50,
  },

  scroll: {
    paddingBottom: 24,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 6,
    marginTop: 10,
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
    width: 40,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },

  editActionsRow: {
    flexDirection: "row",
    gap: 8,
  },

  iconActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },

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
    borderColor: "#ED5514",
    alignItems: "center",
    justifyContent: "center",
  },

  dayBtnScheduled: {
    backgroundColor: "#FFF0E8",
    borderColor: "#ED5514",
  },

  dayBtnDisabled: {
    backgroundColor: "#F2F2F2",
    borderColor: "#DDD",
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

  dayTextScheduled: {
    color: "#ED5514",
  },

  dayTextActive: {
    color: "#fff",
  },

  routineMessage: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#888",
    marginBottom: 14,
  },

  routineHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#888",
    marginBottom: 14,
  },

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

  workoutInput: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 4,
    marginBottom: 6,
  },

  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ED5514",
    borderRadius: 6,
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },

  eventInfo: {
    flex: 1,
    gap: 4,
  },

  eventName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#fff",
  },

  eventMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#fff",
    opacity: 0.9,
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

  eventEmptyMessage: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    paddingVertical: 12,
  },

  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
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

  tabItemActive: {
    borderWidth: 1,
    borderColor: "#ED5514",
  },

  tabIcon: {
    width: 25,
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#E63946",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },

  badgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "#fff",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },

  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },

  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 16,
    textAlign: "center",
  },

  modalIconsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  modalIconItem: {
    width: "30%",
    alignItems: "center",
    marginBottom: 16,
  },

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

  eventModalCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },

  eventModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  eventModalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },

  eventInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },

  eventInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#333",
  },

  eventRowInputs: {
    flexDirection: "row",
    gap: 10,
  },

  eventInputBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 10,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },

  eventDateInput: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    overflow: "hidden",
  },

  eventDateText: {
    flex: 1,
    flexShrink: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#333",
  },

  eventDescInput: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#333",
    minHeight: 100,
  },

  saveBtn: {
    backgroundColor: "#ED5514",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },

  saveBtnText: {
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    fontSize: 15,
  },

  cancelBtn: {
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },

  cancelBtnText: {
    fontFamily: "Inter_600SemiBold",
    color: "#333",
    fontSize: 15,
  },

  deleteBtn: {
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },

  deleteBtnText: {
    fontFamily: "Inter_600SemiBold",
    color: "#E63946",
    fontSize: 15,
  },
});