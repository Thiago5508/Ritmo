import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { createContext, useCallback, useContext, useState } from "react";

export type TrainingIconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];
export type Day = "SEG" | "TER" | "QUA" | "QUI" | "SEX" | "SAB" | "DOM";
export type LevelKey = "sem_nivel" | "iniciante" | "intermediario" | "avancado";
export type Workout = { icon: TrainingIconName; desc1: string };
export type WeekSchedule = Record<Day, Workout>;
export type WorkoutSource = "individual" | "nivel";

export const DAYS: Day[] = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

export const buildEmptyWeek = (): WeekSchedule =>
  DAYS.reduce((acc, day) => {
    acc[day] = { icon: "run", desc1: "" };
    return acc;
  }, {} as WeekSchedule);

type ScheduleContextType = {
  nivelSchedule: Record<LevelKey, WeekSchedule>;
  individualSchedule: Record<string, WeekSchedule>;
  setNivelWorkout: (level: LevelKey, day: Day, workout: Workout) => void;
  setIndividualWorkout: (alunoId: string, day: Day, workout: Workout) => void;
  clearIndividualWorkout: (alunoId: string, day: Day) => void;
  resolveWorkout: (
    alunoId: string,
    level: LevelKey,
    day: Day
  ) => { workout: Workout; source: WorkoutSource };
};

const ScheduleContext = createContext<ScheduleContextType | null>(null);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [nivelSchedule, setNivelSchedule] = useState<Record<LevelKey, WeekSchedule>>({
    sem_nivel: buildEmptyWeek(),
    iniciante: { ...buildEmptyWeek(), QUA: { icon: "run", desc1: "5×100 desaquecimento\n2km na calma!" } },
    intermediario: buildEmptyWeek(),
    avancado: buildEmptyWeek(),
  });
  const [individualSchedule, setIndividualSchedule] = useState<Record<string, WeekSchedule>>({});

  const setNivelWorkout = useCallback((level: LevelKey, day: Day, workout: Workout) => {
    setNivelSchedule((prev) => ({ ...prev, [level]: { ...prev[level], [day]: workout } }));
  }, []);

  const setIndividualWorkout = useCallback((alunoId: string, day: Day, workout: Workout) => {
    setIndividualSchedule((prev) => ({
      ...prev,
      [alunoId]: { ...(prev[alunoId] ?? buildEmptyWeek()), [day]: workout },
    }));
  }, []);

  const clearIndividualWorkout = useCallback((alunoId: string, day: Day) => {
    setIndividualSchedule((prev) => {
      if (!prev[alunoId]) return prev;
      return {
        ...prev,
        [alunoId]: { ...prev[alunoId], [day]: { icon: "run", desc1: "" } },
      };
    });
  }, []);

  // Regra de prioridade: individual (se preenchido) > nível
  const resolveWorkout = useCallback(
    (alunoId: string, level: LevelKey, day: Day) => {
      const individual = individualSchedule[alunoId]?.[day];
      if (individual && individual.desc1.trim()) {
        return { workout: individual, source: "individual" as const };
      }
      return { workout: nivelSchedule[level][day], source: "nivel" as const };
    },
    [individualSchedule, nivelSchedule]
  );

  return (
    <ScheduleContext.Provider
      value={{
        nivelSchedule,
        individualSchedule,
        setNivelWorkout,
        setIndividualWorkout,
        clearIndividualWorkout,
        resolveWorkout,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule deve ser usado dentro de ScheduleProvider");
  return ctx;
}