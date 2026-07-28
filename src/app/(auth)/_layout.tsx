import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="planilha" />
      <Stack.Screen name="mural" />
      <Stack.Screen name="perfilpro" />
      <Stack.Screen name="alunos" />
      <Stack.Screen name="perfil-aluno" />
    </Stack>
  );
}