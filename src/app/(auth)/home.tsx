import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();

  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  function handleLogin() {
    const sucesso = login(telefone, senha);

    if (sucesso) {
      router.push("/(auth)/planilha");
    } else {
      setErro("Telefone ou senha incorretos.");
    }
  }

  return (
    <SafeAreaView style={styles.safe}>

      {/* FUNDO */}
      <Image
        source={require("../../../assets/images/background.jpg")}
        style={styles.background}
        resizeMode="cover"
      />

      {/* ESCURECIMENTO */}
      <View style={styles.overlay} />

      {/* CONTEÚDO */}
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>

            <Image
              source={require("../../../assets/images/logo-login.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <TextInput
              style={styles.input}
              placeholder="Digite seu telefone (apenas números)"
              placeholderTextColor="#999"
              value={telefone}
              onChangeText={setTelefone}
              autoCapitalize="none"
              keyboardType="phone-pad"
              returnKeyType="next"
            />

            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            {erro ? (
              <Text style={styles.erro}>
                {erro}
              </Text>
            ) : null}

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
            >
              <Text style={styles.buttonText}>
                Entrar
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000",
  },

  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  keyboard: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  form: {
    width: "100%",
    alignItems: "center",
  },

  logo: {
    height: 200,
    marginBottom: 60,
  },

  input: {
    fontFamily: "Inter_400Regular",
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 9,
    backgroundColor: "#fff",
  },

  erro: {
    fontFamily: "Inter_400Regular",
    color: "#E63946",
    fontSize: 13,
    marginBottom: 8,
    alignSelf: "flex-start",
  },

  button: {
    width: "100%",
    backgroundColor: "#ED5514",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },

  buttonText: {
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    fontSize: 16,
  },
});