import React, { useEffect, useState } from "react";
import Budget_card from "./Budget_card";
import styles from "../../styles";
import * as DB from '../../database/envelopeDB';
import { View, Text, ActivityIndicator, ScrollView, SafeAreaView,TouchableOpacity, Modal, TextInput, AppState } from "react-native";
import { CommonActions } from '@react-navigation/native';
import RNRestart from 'react-native-restart'; // Import the restart library
import * as Updates from 'expo-updates'; 

const Budget_list = ({ navigation,refreshing,initializedDB,setInitializedDB }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(refreshing); 
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [budgetName, setBudgetName] = useState(''); // Budget name input state
  const [notificationMessage, setNotificationMessage] = useState(''); // Notification message state
  const [notificationVisible, setNotificationVisible] = useState(false); // Notification modal visibility state
  const [entryAdded, setEntryAdded] = useState(false); 
  
  // Fetch envelope data from the database
  const fetchData = async () => {
    try {
      const envelopes = await DB.selectEnvelope();
      ////console.log("Envelopes after fetching:", envelopes);
           
      const formattedData = envelopes.map((envelope) => ({
        id: envelope.id,
        title: envelope.name,
        dateCreated: envelope.dateAdded,        
      }))
      .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)); // Sort by date in descending order
      
      setData(formattedData);
    } 
    catch (error) {       
      // setNotificationMessage('Error fetching envelopes: '+error+'    initializedDB=>'  + initializedDB);
      // setNotificationVisible(true);
      // console.error("Error fetching envelopes:", error);
     
      // Restart the app on any error
      await Updates.reloadAsync();
      RNRestart.Restart();
    } 
    finally {
      setLoading(false);
    }
  };

   

  const handleAddBudget = async () => {
      ////console.log('Budget Name:', budgetName);
      if (!budgetName) {
        setNotificationMessage('Budget Name is required');
        setNotificationVisible(true);
        return; // Exit the function if name is empty
      }

      try {
        await DB.insertEnvelope(budgetName, new Date().toISOString().split('T')[0]); // Call insertEnvelope with user input and current date
        setNotificationMessage('Budget successfully added!');
        setEntryAdded(true);
        // Toggle refresh state to trigger re-fetch
      } catch (e) {
        setNotificationMessage('Error adding budget!');
      }
      setNotificationVisible(true); // Show notification modal
      setModalVisible(false); // Close input modal
      setBudgetName(''); // Reset input field
    };

     
  useEffect(() => {
     if(initializedDB){    
      // setNotificationMessage('Budget_list view initializedDB=>'  + initializedDB);
      // setNotificationVisible(true);    
       fetchData();
     }     
     else  
     {
        // setNotificationMessage('Errors initializing database initializedDB=>'  + initializedDB);
        // setNotificationVisible(true);
        setInitializedDB(prev => !prev);
        setRefresh(!refresh);
     }
  }, [refresh]); // Re-fetch data when refresh prop changes

 
  
  


   useEffect(() => {
       const subscription = AppState.addEventListener('change', (nextAppState) => {
         if (nextAppState === 'active') {
           // App has come to the foreground, refresh data
           fetchData();
         }
       });
   
       return () => {
         subscription.remove();
       };
     }, []);
  

  const handleNotificationOk = () => {
    setNotificationVisible(false); // Close notification modal
    if (entryAdded) {
      setRefresh(!refresh); 
      setEntryAdded(false); // Reset setEntryAdded state
    }
    
  };




  return (
     <SafeAreaView style={{ flex: 1 }}>     
        <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)} // Open modal
        >
          <Text style={styles.buttonText}>Add Budget</Text>
        </TouchableOpacity> 
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={styles.cardsContainer}>
              {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : data.length > 0 ? (
                data.map((job) => (
                  <Budget_card
                    key={job.id}
                    env_id={job.id}
                    title={job.title}             
                    dateCreated={job.dateCreated}  
                    shadowVisible={true}
                    setRefresh={setRefresh}
                    initializedDB={initializedDB}
                    setInitializedDB={setInitializedDB}
                  />
                ))
              ) : (
                <Text>No budgets found.</Text>
              )}
            </View>
          </ScrollView>
          <Modal
                  animationType="slide"
                  transparent={true}
                  visible={modalVisible}
                  onRequestClose={() => setModalVisible(false)} // Handle back button close
                >
                  <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                      <Text style={styles.modalText}>Enter Budget Name:</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Budget Name"
                        value={budgetName}
                        onChangeText={setBudgetName} // Update state with input value
                      />
                      <View style={styles.buttonContainer}>
                        <TouchableOpacity
                          style={styles.button}
                          onPress={handleAddBudget}
                        >
                          <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.button, styles.cancelButton]}
                          onPress={() => setModalVisible(false)} // Close modal
                        >
                          <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
            </Modal>
             {/* Notification Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={notificationVisible}
        onRequestClose={() => setNotificationVisible(false)} // Handle back button close
      >
        <View style={styles.notificationContainer}>
          <View style={styles.notificationView}>
            <Text style={styles.notificationText}>{notificationMessage}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleNotificationOk} // Close notification modal and trigger refresh if needed
            >
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Budget_list;