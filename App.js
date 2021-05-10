import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from 'react';
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";
import { StyleSheet, Text, View, TextInput, FlatList, Modal, TouchableOpacity} from 'react-native';


 /*Array de datos de ejemplo, para saber la estructura que va a tener nuestro modelo de datos*/
 const TAREAS = [{
      id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
      nombreTarea: 'Tarea 1'
      },
      {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28b3',
        nombreTarea: 'Tarea 2'
        },
    ];

    function openDatabase() {
      if (Platform.OS === "web") {
        return {
          transaction: () => {
            return {
              executeSql: () => {},
            };
          },
        };
      }
    
      const db = SQLite.openDatabase("db.db");
      return db;
    }
    
    const db = openDatabase();


export default function App() {

  const [isModalVisible, setisModalVisible] = useState(false); //Hook que controla la visibilidad del modal
  const [textoInput, setTextoInput] = useState(""); //Hook que recibe los datos del input en una nueva tarea
  const [textoInputEditar, setTextoInputEditar] = useState(""); //Hook que recibe los datos del input de la tarea selecionada
  const [idEditar, setIdEditar] = useState(""); //Hook que recibe el id de la tarea seleccionada
  const [listadoTareas, setListadoTareas] = useState([]); // Hook con el array que recibe los datos del otro hook


  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS items (id INTEGER, text TEXT)'
      );
      /*tx.executeSql("insert into items (id, text) values (?, ?)", ["Idprueba", "Textoprueba"]);
      tx.executeSql("insert into items (id, text) values (?, ?)", ["Idprueba2", "Textoprueba2"]);*/
      tx.executeSql("select * from items", [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
    })
  }, [])

 /* Maqueto un item del listado */
const renderItem = ({item, index}) => {
  return(
      <View style={styles.item}>
        <View>
          <Text style={styles.textoitem}>{item.nombreTarea}</Text>
        </View>
        <View style={styles.itemcontainerbotones}>
          <TouchableOpacity style={styles.botones} onPress={()=> EliminarTarea(item)}><Text style={styles.botonestexto}>Completar</Text></TouchableOpacity>
          <TouchableOpacity style={styles.botones} onPress={()=> EditarTarea(item)}><Text style={styles.botonestexto}>Editar</Text></TouchableOpacity>
        </View>
      </View>

  )

}


  //Función que llama al hook y le pasa los datos
  function NuevaTarea (){
    db.transaction(tx => {
      
      tx.executeSql("insert into items (id, text) values (?, ?)", [Date.now(), textoInput]);
      tx.executeSql("select * from items", [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
    })
    setListadoTareas(listadoTareas => [...listadoTareas,{"id": Date.now(), "nombreTarea": textoInput}]) //Añado un nuevo elemento al final del array
    setTextoInput(""); // Notifico al hook correspondiente para que le pase un valor vacío al textinput y lo limpie
    
  }

  function EliminarTarea(item){

    db.transaction(tx => {
      
      tx.executeSql('DELETE FROM items WHERE id = ? ', [item.id]);
      tx.executeSql("select * from items", [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
    })

    
    console.log(item.id)
    console.log(item.nombreTarea)
    var filtered = listadoTareas.filter(function(el) { return el.id != item.id; }); // Todo lo que no corresponda con el id de la que hay que borrar se mantiene
    setListadoTareas(filtered);
      
  }


  function EditarTarea(item){

      setisModalVisible(true) //Muestro el modal
      setIdEditar(item.id) //Le paso al hook el id seleccionado
      setTextoInputEditar(item.nombreTarea) //Le paso al hook el texto de la tarea
      
  }

  function GuardarTarea(){

      //Elemento nuevo qye capta lo que ha cambiado mi usuario
                      
      let tarea = {"id": idEditar, "nombreTarea": textoInputEditar};

      //Creo una copia de mi listado

      let listadoTareasCopia = [...listadoTareas];

      //Busco el id que coincida con el que estoy editando
      let targetIndex = listadoTareas.findIndex(f=>f.id===idEditar); 

      //Cambio el elemento de mi array por el nuevo que tengo arriba
      listadoTareasCopia[targetIndex] = tarea;

      //Se lo paso al hook de las tareas
      setListadoTareas(listadoTareasCopia);
      
      //Cierro el modal avisando al hook que lo controla
      setisModalVisible(false)

  }

  function CerrarModal(){

    setisModalVisible(false) //Cierro el modal notificando al hook

  }


 

  return (
    
    <View style={styles.container}>
      <View style={styles.formulario}>
        <StatusBar style="auto" backgroundColor="white"/>
        <Text style={styles.title}>Escribe una nueva tarea</Text>
        <TextInput style={styles.input} onChangeText={setTextoInput} value={textoInput}></TextInput>
        <TouchableOpacity style={styles.botones} onPress={NuevaTarea}><Text style={styles.botonestexto}>Añadir</Text></TouchableOpacity> 
      </View>
      <View style={styles.listado}>
        <FlatList
          data={listadoTareas} //Le paso el hook que contiene los datos del listado
          renderItem={renderItem} //Le paso el item que hemos maquetado antes
          keyExtractor={item => item.id.toString()} //Debe ser un string
          //extraData={actualiza}//Le paso el hook donde indico cuando se actualiza la lista.
        />
        <Modal 
          animationType='fade'
          visible={isModalVisible}
          onRequestClose={()=> setisModalVisible(false)}
          
        > 
          <View style={styles.modalcontainer}>
            <View style={styles.modalconatinertitulo}>
              <TextInput style={styles.input} defaultValue={textoInputEditar} onChangeText={setTextoInputEditar} value={textoInputEditar}></TextInput> 
            </View>
            <View style={styles.modalcontainerbotones}>
              <TouchableOpacity style={styles.botones} onPress={GuardarTarea}><Text style={styles.botonestexto}>Guardar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.botones} onPress={CerrarModal}><Text style={styles.botonestexto}>Cerrar</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formulario: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  listado: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalcontainer:{
    flexDirection: 'column',
    flex: 1,
  },
  modalconatinertitulo:{
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  modalcontainerbotones:{
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
  },
  botonestexto:{
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase"
  },
  botones: {
    backgroundColor: '#ef5350',
    margin: 10,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  input: {
    width: "80%",
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#eceff1',
    borderRadius: 10,
    flex: 1,
    minWidth: '80%',
  },
  textoitem: {
    fontSize: 18,
    color: '#62757f',
  },
  itemcontainerbotones: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'space-between',
    justifyContent: 'center',
    width: '100%',
  },
  title: {
    fontSize: 20,
    
  },

  
 
});
