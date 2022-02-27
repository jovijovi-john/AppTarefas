import { SafeAreaView, StyleSheet, TextInput, Text, TouchableOpacity} from 'react-native';
import React, { useState } from 'react';

import firebase from "../../services/FirebaseConection"

export default function Login({changeStatus}) {
  
  const [type, setType] = useState("login")
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    
    if (type === "login"){
      // Login
      const user = firebase.auth().signInWithEmailAndPassword(email, password)
     
      .then((user) => {
        // aqui ele passa o uid do usuario para o app.js, assim a tela sairá de login para a home
        changeStatus(user.user.uid);
      })
      
      .catch((err) => {
        alert(err + "\nOps, parece que aconteceu algum erro");
        return;
      })
      
    } else {
      // Cadastrando usuário
      const user = firebase.auth().createUserWithEmailAndPassword(email, password)
      
      .then((user) => {
        changeStatus(user.user.uid);
      })

      .catch((err) => {
        alert(err + "\nOps, parece que algo deu errado");
        return;
      })
    }
  }

  return (
    <SafeAreaView style={styles.container}>

      <TextInput 
        value={email}
        placeholder='Seu email'
        placeholderTextColor={"#999"} 
        style={styles.input}
        onChangeText={value => {setEmail(value)}}
      />
      
      <TextInput 
        value={password}
        placeholder='**********'
        placeholderTextColor={"#999"} 
        style={styles.input}
        onChangeText={value => {setPassword(value)}}
      />

      <TouchableOpacity 
        style={[styles.handleLogin, {backgroundColor: type === "login" ? "#3ea6f2" : "#141414"}]}
        onPress={handleLogin}
        
      >
        <Text style={styles.loginText}>
          { type === "login" ? "Acessar" : "Cadastrar" }
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => setType(type === "login" ? "cadastrar" : "login")}
      >
        <Text style={[styles.text, {textAlign: "center"}]}>
          { type === "login" ? "Criar uma conta" : "Já possuo uma conta" }
        </Text>
      </TouchableOpacity>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 10,
    backgroundColor: "#f2f6fc"
  },

  text: {
    color: "#000"
  },

  input: {
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 4,
    padding: 10,
    borderWidth: 1,
    borderColor: "#141414",
    color: "#000"
  },

  handleLogin: {
    alignItems: "center",
    justifyContent: "center",
    height: 45,
    marginBottom: 10
  },

  loginText: {
    color: "#fff"
  }
})