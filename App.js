import { 
  View, 
  SafeAreaView, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,  
  Text,
  Keyboard,
  FlatList
} from 'react-native'

import React, { useState, useEffect, useRef } from 'react';

import Feather from "react-native-vector-icons/Feather";

import Login from './src/components/Login';
import TaskList from "./src/components/TaskList";
import firebase from "./src/services/FirebaseConection";


export default function App() {

  // Consts -----------------------------------------

  const [user, setUser] = useState(null);
  const [newTask, setNewTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const inputRef = useRef(null);
  const [key, setKey] = useState("");

  // Functions --------------------------------------

  useEffect(() => {

    function getUser() {
      
      // se ele entrou de alguma forma nessa tela sem ter logado, nao procura nada.
      if(!user) {
        return;
      }

      firebase.database().ref("tarefas").child(user).once("value", (snapshot) => {
        
        setTasks([]);

        snapshot?.forEach((childItem) => {
          let data = {
            key: childItem.key,
            nome: childItem.val().nome
          }          

          setTasks(oldTasks => [...oldTasks, data])
        })
      })
    }

    getUser();

  }, [user])

  function handleEdit(data){
    setKey(data.key);
    setNewTask(data.nome);
    inputRef.current.focus();
  }

  function handleAdd(){

    if (newTask === ""){
      return;
    }

    // usuario quer editar uma tarefa

    if (key !== ""){
      firebase.database().ref("tarefas").child(user).child(key).update({
        nome: newTask
      })

      .then(()=>{

        // vai procurar em toda nossa lista de tasks o item que tem a key igual à da tarefa que estamos editando. Assim, ele vai devolver para nosso taskIndex a posição dessa tarefa
        const taskIndex = tasks.findIndex( item => item.key === key);
        let taskClone = tasks;
        taskClone[taskIndex].nome = newTask;

        setTasks([...taskClone]);
      });

      Keyboard.dismiss();
      setNewTask("");
      setKey("");

      return ;
    }

    // criando um nó tarefas com filho cujo nome será o uid do usuario, com isso não teremos conflito de tarefas de um usuario aparecendo no app de outro usuario
    let tarefas = firebase.database().ref("tarefas").child(user);

    // criando uma key especifica para cada tarefa, para que cada uma delas seja diferente da outra
    let chave = tarefas.push().key;

    tarefas.child(chave).set({
      nome: newTask
    })
    
    .then(()=>{
      const data = {
        key: chave,
        nome: newTask
      };

      // pegando as tarefas antigas e acrescentando a mais a nova tarefa
      setTasks(oldTasks => [...oldTasks, data]);
      
      Keyboard.dismiss();
      setNewTask("");
    })

  }

  function handleDelete(chave){
    firebase.database().ref("tarefas").child(user).child(chave).remove()
    .then(()=>{
        //  vai pegar todas as tasks menos a que eu cliquei, que no caso é a que queremos deletar
        const findTasks = tasks.filter( item => item.key !== chave);
        setTasks(findTasks);
    })
  }

  function cancelEdit() {
    setKey("");
    setNewTask("");
    Keyboard.dismiss();
  }


  // App

  if (!user) {
    return <Login changeStatus={ (user) => setUser(user) }/>
  }

  return (
    
    <SafeAreaView style={styles.container}>

      { key.length > 0 && (
        <View style={{flexDirection: "row", marginBottom: 8}}>
          <TouchableOpacity onPress={cancelEdit}>
            <Feather name="x-circle" color={"#ff0000"} size={20}/>
          </TouchableOpacity>
          
          <Text style={{color: "#ff0000", marginLeft: 5 }}>
            Você está editando uma tarefa
          </Text>
        </View>
      )}

      <View style={styles.containerTask}>
        <TextInput 
          value={newTask}
          onChangeText={ (text) => setNewTask(text) }
          style={styles.input}
          placeholder="O que vai fazer hoje?"
          placeholderTextColor={"#999"}
          ref={inputRef}
        />

        <TouchableOpacity style={styles.buttonAdd} onPress={handleAdd}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        keyExtractor={(item) => item.key} 
        data={tasks}
        renderItem={ ({ item }) => (
          <TaskList data={item} deleteItem={handleDelete} editItem={handleEdit}/>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    paddingHorizontal: 10,
    backgroundColor: "#f2f6fc"
  },

  text: {
    color: "#000"
  },

  containerTask: {
    flexDirection: "row"
  },

  input: {
    flex: 1,
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#141414",
    height: 45,
    color: "#000"
  },

  buttonAdd: {
    backgroundColor: "#141414",
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
    paddingHorizontal: 14,
    borderRadius: 4
  },

  buttonText: {
    color: "#fff",
    fontSize: 22
  }
  
})
