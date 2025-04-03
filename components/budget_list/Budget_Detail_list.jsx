import React, { useEffect, useState } from "react";
import Budget_Detail_card from "./Budget_Detail_card";
import styles from "../../styles";
import * as DB from '../../database/envelopeDB';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Modal, TextInput, SafeAreaView, Platform, AppState } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import Footer from "../footer/Footer";
import { Picker } from '@react-native-picker/picker'; // Import Picker from @react-native-picker/picker
import RNRestart from 'react-native-restart'; // Import the restart library
import * as Updates from 'expo-updates'; 

const Budget_Detail_list = ({ route }) => {
  // const { envId } = route.params;
  // const {title} = route.params;
  // const {refreshBudList} = route.params;
  const { envId, title, refreshBudList,initializedDB,setInitializedDB } = route.params;
  

   

  console.log("Envelope ID:", envId);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [description, setDescription] = useState(''); // Description input state
  // const [incomeDate, ] = useState(new Date()); // Income date input state
  const [entryType, setEntryType] = useState('Allocated Income');   
  const [amount, setAmount] = useState(''); // Amount input state
  const [entryDate, setEntryDate] = useState(new Date()); // Entry date input state
  const [showDatePicker, setShowDatePicker] = useState(false); // Date picker visibility state
  const [notificationVisible, setNotificationVisible] = useState(false); // Notification modal visibility state
  const [notificationMessage, setNotificationMessage] = useState(''); // Notification message state
  const [refresh, setRefresh] = useState(false); // Local refresh state
  const [remainingIncome, setRemainingIncome] = useState(0); // Remaining income state
  const [possibleRemainingIncome, setPossibleRemainingIncome] = useState(0); // Possible remaining income state
  const[remainingAllocation, setRemainingAllocation] = useState(0); // Remaining allocation state
  const [possibleRemainingAllocation, setPossibleRemainingAllocation] = useState(0); // Possible remaining allocation state
   
  
  // Fetch envelope detail data from the database
  const fetchData = async () => {
    try {
      const envelopeDetails = await DB.selectEnvelopeDetail(envId);
      console.log("Envelope details after fetching:", envelopeDetails);

      // Map data to match your component's expected format
      const formattedData = envelopeDetails.map((detail) => ({
        id: detail.id,
        title: detail.description,
        type: detail.type,
        dateCreated: detail.date,
        env_amount: detail.amount.toString(), 
      }))
      .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)); // Sort by date in descending order
     
      setData(formattedData);
    } catch (error) {      
      // setNotificationMessage("Error fetching envelope details: "+error+'   envId passed is -->'+envId +'initializedDB=>'  + initializedDB);
      // setNotificationVisible(true);
      // console.error("Error fetching envelope details:", error);
      
       // Restart the app on any error
       await Updates.reloadAsync();
       RNRestart.Restart();
    } finally {
      setLoading(false);
    }
  };

    

  const handleAddEntry = async () => {
    console.log('Description:', description);
    console.log('Entry Type:', entryType);
    console.log('Amount:', amount);
    console.log('Entry Date:', entryDate);
    

    if (!description) {
      setNotificationMessage('Description is required');
      setNotificationVisible(true);
      return; // Exit the function if description is empty
    }

    if (!amount) {
      setNotificationMessage('Amount is required');
      setNotificationVisible(true);
      return; // Exit the function if amount is
    }



    try {
      const dateAdded = formatDate(entryDate);
      console.log("Date Added is: >>>>>>>>>>>>>", dateAdded);
      // await DB.insertEnvelopeDetail(description, entryType, parseFloat(amount), entryDate.toISOString().split('T')[0], envId); // Call insertEnvelopeDetail with user input
      await DB.insertEnvelopeDetail(description, entryType, parseFloat(amount), dateAdded, envId); // Call insertEnvelopeDetail with user input
      setNotificationMessage('Entry successfully added!');
      setRefresh(!refresh); // Toggle refresh state to trigger re-fetch
      refreshBudList(prev => !prev);
    } catch (e) {
       // Restart the app on any error
       await Updates.reloadAsync();
       RNRestart.Restart();
      setNotificationMessage('Error adding entry!');
    }
    setNotificationVisible(true); // Show notification modal
    setModalVisible(false); // Close input modal
    setDescription(''); // Reset input field
    setEntryType('Allocated Income'); // Reset input field
    setAmount(''); // Reset input field
    setEntryDate(new Date()); // Reset input field
  };

  // const handleDateChange = (event, selectedDate) => {
  //   const currentDate = selectedDate || incomeDate;
  //   setShowDatePicker(Platform.OS === 'ios');    
  //   setEntryDate(currentDate);
  // };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || entryDate;    
    setShowDatePicker(false); // Close the date picker
    setEntryDate(currentDate);
    console.log("Entry Date is:******** ", formatDate(currentDate));
  };

  const formatDate = (date) => {
    const adjustedDate = new Date(date);
    adjustedDate.setDate(adjustedDate.getDate() + 1); // Subtract one day

    const year = adjustedDate.getFullYear();
    const month = String(adjustedDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(adjustedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAmountChange = (text) => {
    // Allow only numbers and decimal points
    const newText = text.replace(/[^0-9.]/g, '');
    setAmount(newText);

    if (entryType === 'Allocated Income') {
     // Compute possible remaining income
      const possibleRemaining = remainingIncome - parseFloat(newText || 0);
     
      if (possibleRemaining < 0) {
        setAmount();
        setNotificationMessage('Amount must not be greater than the Remaining Income');
        setNotificationVisible(true);
        setPossibleRemainingIncome(remainingIncome);
      }
      else 
      {
        setPossibleRemainingIncome(possibleRemaining.toFixed(2));                 
      }
    }
    else 
    {
      // Compute possible remaining allocation
      const possibleRemaining = remainingAllocation - parseFloat(newText || 0);
      console.log(" Remaining Allocation is--->: ", remainingAllocation);
      // if (possibleRemaining < 0) {
      //   setAmount();
      //   setNotificationMessage('Amount must not be greater than the Remaining Allocation');
      //   setNotificationVisible(true);
      //   setPossibleRemainingAllocation(remainingAllocation);
      // }
      // else 
      // {
        setPossibleRemainingAllocation(possibleRemaining.toFixed(2));
      // }
      
    }

  };

  useEffect(() => {
    if (initializedDB) {
      console.log('Budget Detail List: DB status ======> '+initializedDB);
      fetchData();
    }
    else {
      setNotificationMessage('Error initializing database');
      setNotificationVisible(true);
      setInitializedDB(prev => !prev);
      setRefresh(!refresh);
    }
      
  }, [refresh]); // Re-fetch data when refresh state changes


  
    const fetchRemainingIncome = async () => {
      try {
        const income = await DB.getRemainingIncome();
        setRemainingIncome(parseFloat(income).toFixed(2)); // Round off to two decimal places
      } catch (error) {
        console.error("Error fetching remaining income:", error);
      }
    };


    const fetchRemainingAllocation = async () => {
          try {
            const allocation = await DB.getRemainingAllocation(envId);
            console.log("Total Allocation for this budget: ", allocation);

            // setRemainingAllocation(parseFloat(allocation).toFixed(2));
            setPossibleRemainingAllocation(isNaN(allocation) ? '0.00' : parseFloat(allocation).toFixed(2));
            setRemainingAllocation(isNaN(allocation) ? '0.00' : parseFloat(allocation).toFixed(2));
          } catch (error) {
            console.error("Error fetching remaining allocation:", error);
          }
        };
  useEffect(() => {
    fetchRemainingAllocation();
    fetchRemainingIncome();
  }, [refresh]); 


  useEffect(() => {
      const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          // App has come to the foreground, refresh data
          fetchRemainingAllocation();
          fetchRemainingIncome();
        }
      });
  
      return () => {
        subscription.remove();
      };
    }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity
        style={styles.IncomeAddEntryButton}
        onPress={() => {
                          setAmount('');
                          setModalVisible(true);
                          setPossibleRemainingIncome(remainingIncome);
                          setPossibleRemainingAllocation(remainingAllocation);
                       } } // Open modal
      >
        <Text style={styles.buttonTextBlack}>Add Entry</Text>
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.cardsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : data.length > 0 ? (
            data.map((job) => (
              <Budget_Detail_card
                key={job.id}
                ENV_DET_ID={job.id}
                type={job.type}
                title={job.title}
                env_amount={job.env_amount} // Use 'N/A' or omit it if not required
                dateCreated={job.dateCreated}  
                shadowVisible={true}
                envId={envId}
                setRefresh={setRefresh}
                refreshBudList={refreshBudList}
              />
            ))
          ) : (
            <Text>No incomes found.</Text>
          )}
        </View>
      </ScrollView>     
      <Footer style={{ flexShrink: 0 }} showManageIncomeButton={false}  refresh={refresh} envId={envId} />
          
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // Handle back button close
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Enter Entry Details:</Text>
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={description}
              onChangeText={setDescription} // Update state with input value
            />
            <Picker
              selectedValue={entryType}
              style={styles.input}
              onValueChange={(itemValue) => setEntryType(itemValue)}
            >
              <Picker.Item label="Allocated Income" value="Allocated Income" />
              <Picker.Item label="Expense" value="Expense" />
            </Picker>
            <TextInput
              style={styles.input}
              placeholder="Amount"
              value={amount}
              onChangeText={handleAmountChange} // Update state with validated input value
              keyboardType="numeric"
            />

            {entryType === 'Allocated Income' && (
              <Text style={styles.possibleRemainingIncome}>
                Expected Remaining Income: <Text style={styles.possibleRemainingIncomeAmount}>{possibleRemainingIncome}</Text>
              </Text>
            )}

            {entryType === 'Expense' && (
              <Text style={styles.possibleRemainingAllocation}>
                Expected Remaining Allocation: <Text style={styles.possibleRemainingAllocationAmount}>{possibleRemainingAllocation}</Text>
              </Text>
            )}


            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)} // Show date picker
            >
              <Text>{entryDate.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={entryDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleAddEntry}
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

export default Budget_Detail_list;