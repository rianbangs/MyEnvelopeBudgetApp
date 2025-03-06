import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, Modal, TextInput, Platform, AppState } from 'react-native';
import styles from './Budget_Detail_card.style.jsx';
import { icons } from '../../constants/index.js';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as DB from '../../database/envelopeDB'; // Import the database functions

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const Budget_Detail_card = ({ ENV_DET_ID, type, title, env_amount, dateCreated, shadowVisible, envId, setRefresh,refreshBudList }) => {
  
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); // Delete confirmation modal visibility state
  const [description, setDescription] = useState(title);
  const [entryType, setEntryType] = useState(type);  
  const [amount, setAmount] = useState(''); // Amount input state
  const [entryDate, setEntryDate] = useState(new Date(dateCreated));
  const [showDatePicker, setShowDatePicker] = useState(false); // Date picker visibility state
  const [notificationVisible, setNotificationVisible] = useState(false); // Notification modal visibility state
  const [notificationMessage, setNotificationMessage] = useState(''); // Notification message state
  const [remainingIncome, setRemainingIncome] = useState(0); // Remaining income state
  const [possibleRemainingIncome, setPossibleRemainingIncome] = useState(0); // Possible remaining income state
  const[remainingAllocation, setRemainingAllocation] = useState(0); // Remaining allocation state
  const [possibleRemainingAllocation, setPossibleRemainingAllocation] = useState(0); // Possible remaining allocation state
  const [refreshLocal, setRefreshLocal] = useState(false); // Local refresh state
  const [envelope_amt, setEnvelope_amt] = useState(env_amount); // Envelope amount state
  const [entryTypeChanged, setEntryTypeChanged] = useState(false); // Track entryType change
  const [entryDeleted, setEntryDeleted] = useState(false); // Track if entry was deleted

  const handleUpdate = async () => {

    if (!description) {
      setNotificationMessage('Description is required');
      setNotificationVisible(true);
      return; // Exit the function if description is empty
    }

    if (!amount) {
      setNotificationMessage('Amount is required');
      setNotificationVisible(true);
      return; // Exit the function if amount is empty
    }

    try {
      // console.log(ENV_DET_ID+","+ description+" , "+ entryType+" , "+ parseFloat(amount)+" , "+ entryDate.toISOString().split('T')[0]+" , "+ ENV_DET_ID);
      await DB.updateEnvelopeDetail(ENV_DET_ID, description, entryType, parseFloat(amount), entryDate.toISOString().split('T')[0]);
      // setDescription(description); 
      setEnvelope_amt(parseFloat(amount));
      setRefreshLocal(!refreshLocal); 
      setRefresh(prev => !prev); // Trigger refresh in parent component
      refreshBudList(prev => !prev); 

      console.log('Entry updated successfully');
      setNotificationMessage('Entry updated successfully');
      setNotificationVisible(true); // Show notification modal
      setModalVisible(false); // Close the modal after updating
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await DB.deleteEnvelopeDetail(ENV_DET_ID);
      console.log('Entry deleted successfully');
      setNotificationMessage('Entry deleted successfully');
      setNotificationVisible(true); // Show notification modal
      setDeleteModalVisible(false); // Close the delete confirmation modal
      setEntryDeleted(true); // Mark entry as deleted
      refreshBudList(prev => !prev); 
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };


  // const handleDateChange = (event, selectedDate) => {
  //   const currentDate = selectedDate || entryDate;
  //   setShowDatePicker(Platform.OS === 'ios');
  //   setEntryDate(currentDate);
  // };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || entryDate;
    setShowDatePicker(false); // Close the date picker
    setEntryDate(currentDate);
  };

  const handleRemainingIncome = (possibleRemaining) => {
    if (possibleRemaining < 0) 
      {
        // setAmount(parseFloat(env_amount).toFixed(2));
        setAmount(parseFloat(remainingIncome).toFixed(2));
        setNotificationMessage('Amount must not be greater than the Remaining Income');
        setNotificationVisible(true);
        setPossibleRemainingIncome(remainingIncome);
      }
  };


  const handleAmountChange = (text) => {
    // Allow only numbers and decimal points
    const newText = text.replace(/[^0-9.]/g, '');
    console.log('New amount:', newText);
    console.log('Remaining Income:', remainingIncome);
    setAmount(newText);
    console.log('Entry Type:', entryType);
    if (entryType === 'Allocated Income') {
      if(type === 'Allocated Income'  && Number(env_amount).toFixed(2) == parseFloat(newText || 0).toFixed(2)){
        const possibleRemaining =  remainingIncome;
        setPossibleRemainingIncome(parseFloat(possibleRemaining).toFixed(2));
      }
      else 
      if(type === 'Expense')
      {
          const possibleRemaining = parseFloat(remainingIncome) - parseFloat(newText || 0);
          setPossibleRemainingIncome(parseFloat(possibleRemaining).toFixed(2));
          handleRemainingIncome(possibleRemaining);         
      }
      else 
      {
        const possibleRemaining = parseFloat(remainingIncome)  + (parseFloat(env_amount) - parseFloat(newText || 0));
        // console.log(possibleRemaining +"="+ remainingIncome +"+("+parseFloat(env_amount)+"-"+parseFloat(newText || 0)+ ")");
        setPossibleRemainingIncome(parseFloat(possibleRemaining).toFixed(2));
        handleRemainingIncome(possibleRemaining);
        
      }    

    } else {
       
      if(type === 'Expense')
      {
            const possibleRemaining = parseFloat(remainingAllocation) + (parseFloat(env_amount) - parseFloat(newText || 0));
          setPossibleRemainingAllocation(possibleRemaining.toFixed(2));
      }   
      else
      if(type === 'Allocated Income')
      {
        const possibleRemaining = (parseFloat(remainingAllocation)) - (parseFloat(env_amount) + parseFloat(newText || 0));
        setPossibleRemainingAllocation(possibleRemaining.toFixed(2));
      }    
       
      
    }
  };

  const handleNotificationOk = () => {
    setNotificationVisible(false); // Close notification modal
    if (entryDeleted) {
      setRefresh(prev => !prev); // Trigger refresh in parent component
      setEntryDeleted(false); // Reset entryDeleted state
    }
  };

  useEffect(() => {
    if (entryTypeChanged) {
      handleAmountChange(env_amount);
      setEntryTypeChanged(false);
    }
  }, [entryTypeChanged]);


    const fetchRemainingIncome = async () => {
      try {
        const income = await DB.getRemainingIncome();
        console.log('Total Income for this budget: ', income);
        setRemainingIncome(parseFloat(income).toFixed(2)); // Round off to two decimal places
      } catch (error) {
        console.error("Error fetching remaining income:", error);
      }
    };

    const fetchRemainingAllocation = async () => {
      try {
        const allocation = await DB.getRemainingAllocation(envId);
        console.log("Total Allocation for this budget: ", allocation);
        setRemainingAllocation(parseFloat(allocation).toFixed(2));
      } catch (error) {
        console.error("Error fetching remaining allocation:", error);
      }
    };
    
  useEffect(() => {  
    fetchRemainingAllocation();
    fetchRemainingIncome();
  }, [refreshLocal]);

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
    <View style={[
      styles.container,
      shadowVisible && styles.shadow,
      type === 'Expense' && styles.expenseBackground // Apply pink background if type is Expense
    ]}>
      {/* Main Content Section */}
      <TouchableOpacity
        style={[styles.cardContainer]}
        onPress={() => console.log(`View details for ${title}`)}
      >
        <View style={styles.textContainer}>
          {/* Left Side: Title and Amount */}
          <View style={styles.leftContainer}>
            <Text style={styles.budgetName} numberOfLines={1}>
              {description}
            </Text>
            <Text style={styles.jobType}>
              <Text style={styles.remainingAllocation}> {envelope_amt}</Text>
            </Text>
            <Text style={styles.jobType}>
              Date:
              <Text style={styles.dateCreated}> {formatDate(dateCreated)}</Text>
            </Text>
            <Text style={styles.leftContainer}>
              {type}
            </Text>
          </View>

          {/* Right Side: Icons */}
          <View style={styles.rightContainer}>
            {/* Edit Button */}
            <TouchableOpacity onPress={() =>{
                                               setModalVisible(true);
                                              //  setPossibleRemainingIncome(remainingIncome);
                                              //  setPossibleRemainingAllocation(remainingAllocation);
                                               setAmount(env_amount); 
                                               handleAmountChange(env_amount);
                                               setEntryType(type);
                                            }}>
              <Image
                source={icons.pencil}
                resizeMode="contain"
                style={styles.likeBtnImage}
              />
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity onPress={() => setDeleteModalVisible(true)}>
              <Image
                source={icons.trash}
                resizeMode="contain"
                style={styles.likeBtnImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Edit Entry</Text>
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
            />
            <Picker
              selectedValue={entryType}
              style={styles.input}
              onValueChange={(itemValue) => {
                setRefreshLocal(!refreshLocal); 
                setEntryType(itemValue);
                setEntryTypeChanged(true);                
              }}
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
              onPress={() => setShowDatePicker(true)}
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
                onPress={handleUpdate}
              >
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() =>{ 
                                  setModalVisible(false);
                                  setEntryType(type);
                              }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

     {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Are you sure you want to delete this entry?</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleDelete}
              >
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.buttonText}>No</Text>
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
              onPress={handleNotificationOk} // Close notification modal and trigger refresh if needed
            >
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Budget_Detail_card;