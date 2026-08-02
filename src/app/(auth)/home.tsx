import { useAuth } from "../../context/AuthContext"; // era "useaAuth" e "../..context"
import { useRouter } from "expo-router";
import React, { useState } from "react"; // estava faltando
import {
  Image,
  ImageBackground,
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
    <ImageBackground
      source={require("../../../assets/images/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Image
          source={require("../../../assets/images/logo-login.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <TextInput
          style={styles.input}
          placeholder="Digite seu telefone (apenas números)"
          placeholderTextColor="#999"
          value={telefone}        // era "email"
          onChangeText={setTelefone} // era "setEmail"
          autoCapitalize="none"
          keyboardType="numeric"  // era "email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#999"
          value={senha}           // era "password"
          onChangeText={setSenha} // era "setPassword"
          secureTextEntry
        />

        {/* Mensagem de erro */}
        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  logo: {
    width: 199,
    marginBottom: 24,
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