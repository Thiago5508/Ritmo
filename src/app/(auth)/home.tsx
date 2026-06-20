import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    console.log("Login com:", email, password);
    router.push("/planilha");
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
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

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
    backgroundColor: "rgba(0,0,0,0.4)", // escurece a imagem para destacar o conteúdo
  },
    logo: {
    width: 199,
    marginBottom: 24,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    marginBottom: 24,
    color: "#fff",
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
  link: {
    fontFamily: "Inter_500Medium",
    marginTop: 20,
    color: "#fff",
  },
});