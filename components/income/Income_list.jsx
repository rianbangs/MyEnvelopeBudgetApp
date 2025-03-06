import React, { useEffect, useState } from "react";
import Income_card from "./Income_card";
import styles from "../../styles";
import * as DB from '../../database/envelopeDB';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Modal, TextInput, SafeAreaView, Platform, AppState } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import Footer from "../footer/Footer";
import RNRestart from 'react-native-restart'; // Import the restart library
 
const Income_list = ({initializedDB , setInitializedDB}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [incomeAmount, setIncomeAmount] = useState(''); // Income amount input state
  const [incomeDate, setIncomeDate] = useState(new Date()); // Income date input state
  const [incomeDetail, setIncomeDetail] = useState(''); // Income detail input state
  const [showDatePicker, setShowDatePicker] = useState(false); // Date picker visibility state
  const [notificationVisible, setNotificationVisible] = useState(false); // Notification modal visibility state
  const [notificationMessage, setNotificationMessage] = useState(''); // Notification message state
  const [refresh, setRefresh] = useState(false); // Local refresh state
   

  

  // Fetch income data from the database
  const fetchData = async () => {
    try {
      const incomes = await DB.selectIncome();
      // console.log("Incomes after fetching in income list:============>", incomes);

      // Map data to match your component's expected format
      const formattedData = incomes.map((income) => ({
        id: income.id,
        title: income.detail,
        dateCreated: income.date,
        incomeAmt: income.amount.toString(), // Assuming amount is the remaining allocation
      }))
      .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)); // Sort by date in descending order
      setData(formattedData);
    } catch (error) {     
      // setNotificationMessage('Error fetching incomes: '+error+'   initializedDB=>'  + initializedDB);
      // setNotificationVisible(true);
      // console.error("Error fetching incomes:", error);
      
       // Restart the app on any error
       RNRestart.Restart();
    } finally {
      setLoading(false);
    }
  };

  

  const handleAddIncome = async () => {
    //console.log'Income Amount:', incomeAmount);
    //console.log'Income Date:', incomeDate);
    //console.log'Income Detail:', incomeDetail);
    if (!incomeDetail) {
      setNotificationMessage('Income Detail is required');
      setNotificationVisible(true);
      
      return; // Exit the function if description is empty
    }

    if (!incomeAmount) {
      setNotificationMessage('Income Amount is required');
      setNotificationVisible(true);       
      return; // Exit the function if amount is empty
    }


    try {
      await DB.insertIncome(parseFloat(incomeAmount), incomeDate.toISOString().split('T')[0], incomeDetail); // Call insertIncome with user input
      setNotificationMessage('Income successfully added!');
      setRefresh(!refresh); // Toggle refresh state to trigger re-fetch
    } catch (e) {
      setNotificationMessage('Error adding income!');
    }
    setNotificationVisible(true); // Show notification modal
    setModalVisible(false); // Close input modal
    setIncomeAmount(''); // Reset input field
    setIncomeDate(new Date()); // Reset input field
    setIncomeDetail(''); // Reset input field
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || incomeDate;
    setShowDatePicker(Platform.OS === 'ios');
    setIncomeDate(currentDate);
  };

  const handleAmountChange = (text) => {
    // Allow only numbers and decimal points
    const newText = text.replace(/[^0-9.]/g, '');
    setIncomeAmount(newText);
  };

  useEffect(() => {
     
     if(initializedDB){       
      console.log("Initialized DB in income list ===========> "+initializedDB); 
       fetchData();
     }
      else
      {
        setNotificationMessage('Error initializing database');
        setNotificationVisible(true);
        setInitializedDB(prev => !prev);
        setRefresh(!refresh);
      }
     
  }, [refresh]); // Re-fetch data when refresh state changes


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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity
        style={styles.IncomeAddButton}
        onPress={() => setModalVisible(true)} // Open modal
      >
        <Text style={styles.buttonText}>Add Income</Text>
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.cardsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : data.length > 0 ? (
            data.map((job) => (
              <Income_card
                key={job.id}
                title={job.title}
                incomeAmt={job.incomeAmt} // Use 'N/A' or omit it if not required
                dateCreated={job.dateCreated}  
                shadowVisible={true}
                incomeId={job.id}
                refreshIncomeList={setRefresh}
              />
            ))
          ) : (
            <Text>No incomes found.</Text>
          )}
        </View>
      </ScrollView>     
      <Footer style={{ flexShrink: 0 }} showManageIncomeButton={false}  refresh={refresh} />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // Handle back button close
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Enter Income Details:</Text>
            <TextInput
              style={styles.input}
              placeholder="Income Amount"
              value={incomeAmount}
              onChangeText={handleAmountChange} // Update state with validated input value
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)} // Show date picker
            >
              <Text>{incomeDate.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={incomeDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Income Detail"
              value={incomeDetail}
              onChangeText={setIncomeDetail} // Update state with input value
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleAddIncome}
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
              onPress={() => setNotificationVisible(false)} // Close notification modal
            >
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Income_list;