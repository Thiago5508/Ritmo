import { Redirect } from "expo-router";
import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return user ? (
    <Redirect href="/(auth)/planilha" />
  ) : (
    <Redirect href="/login" />
  );
}