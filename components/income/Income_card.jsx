import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, Modal, TextInput, AppState } from 'react-native';
import styles from './Income_card.style.jsx';
import {icons } from '../../constants/index.js';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DB from '../../database/envelopeDB'; // Import the database functions


const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

const Income_card = ({ title, incomeAmt,dateCreated, shadowVisible,incomeId,refreshIncomeList }) => {
  const [description, setDescription] = useState(title);
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState(incomeAmt);  
  const [possibleRemainingIncome, setPossibleRemainingIncome] = useState(0); 
  const [entryDate, setEntryDate] = useState(new Date(dateCreated));
  const [showDatePicker, setShowDatePicker] = useState(false); 
  const [remainingIncome, setRemainingIncome] = useState(0);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationVisible, setNotificationVisible] = useState(false); 
  const [refresh, setRefresh] = useState(false); // Local refresh state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [entryDeleted, setEntryDeleted] = useState(false);

  const handleAmountChange = (text) => {
    // Allow only numbers and decimal points
    const newText = text.replace(/[^0-9.]/g, '');
    //console.log('New amount:', newText);
    //console.log('Remaining Income:', remainingIncome);
    setAmount(newText);     
   

    const possibleRemaining = (parseFloat(remainingIncome)  - (parseFloat(incomeAmt)) + parseFloat(newText || 0));
    //console.log(possibleRemaining +"= ("+ remainingIncome +"- "+parseFloat(incomeAmt)+") + ("+parseFloat(newText || 0)+ ")");
    
    handleRemainingIncome(possibleRemaining);
  };

  const handleRemainingIncome = (possibleRemaining) => {
    //console.log(possibleRemaining + " < 0");
    if (possibleRemaining < 0) 
      {
        
        setAmount(parseFloat(incomeAmt).toFixed(2));
        setNotificationMessage('The amount must be equal or higher than '+ parseFloat(incomeAmt).toFixed(2)+ ' because '+ parseFloat(incomeAmt).toFixed(2) + ' is already allocated to the existing budget.');
        setNotificationVisible(true);
        setPossibleRemainingIncome(remainingIncome);
      }

    else {
        setPossibleRemainingIncome(parseFloat(possibleRemaining).toFixed(2));
    }
  };

  const handleUpdate = async () => {
    //console.log("amount is " + amount);

    if (!description) {
      setNotificationMessage('Description is required');
      setNotificationVisible(true);
      setDescription(title);
      return; // Exit the function if description is empty
    }

    if (!amount) {
      setNotificationMessage('Amount is required');
      setNotificationVisible(true);
      setAmount(parseFloat(incomeAmt).toFixed(2));
      handleAmountChange(incomeAmt);
      return; // Exit the function if amount is empty
    }

    // Proceed with the update logic
    try {
     
      await DB.updateIncome(incomeId, parseFloat(amount), entryDate.toISOString().split('T')[0],description);
      setNotificationMessage('Entry updated successfully');
      setNotificationVisible(true);
      setModalVisible(false); // Close the modal after updating
      setRefresh(!refresh); // Trigger refresh in parent component
      refreshIncomeList(prev => !prev); // Trigger refresh in parent component
    } catch (error) {
      console.error('Error updating entry:', error);
      setNotificationMessage('Error updating entry');
      setNotificationVisible(true);
    }
  };


  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || entryDate;
    setShowDatePicker(false); // Close the date picker
    setEntryDate(currentDate);
  };


  const handleNotificationOk = () => {
    setNotificationVisible(false); // Close notification modal
    refreshIncomeList(prev => !prev); 
    setRefresh(!refresh); 
    if (entryDeleted) {
      setRefresh(!refresh);
      setEntryDeleted(false); // Reset entryDeleted state
    }
  };

  
 const handleDelete = async () => {
  // refreshIncomeList(prev => !prev); 
  const RemainingIncome = await DB.getRemainingIncome();

  
  const possibleRemaining = (RemainingIncome  - (parseFloat(incomeAmt))  );
  console.log(possibleRemaining +"= ("+ RemainingIncome +"- "+parseFloat(incomeAmt)+")");
  if (possibleRemaining < 0)
  {
    setNotificationMessage('This amount cannot be removed ( '+ parseFloat(incomeAmt).toFixed(2)+ ' ) because it is already allocated to the existing budget.');
    setNotificationVisible(true);
    setDeleteModalVisible(false);    
    return;
  } 
   
  setDeleteModalVisible(true);  
}

  const proceedDelete = async () => {
      try {
        await DB.deleteIncome(incomeId);
        //console.log('Entry deleted successfully');
        setNotificationMessage('Entry deleted successfully');
        setNotificationVisible(true); // Show notification modal
        setDeleteModalVisible(false); // Close the delete confirmation modal
        setEntryDeleted(true); // Mark entry as deleted      
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
  };

  const fetchRemainingIncome = async () => {
    try {
      const income = await DB.getRemainingIncome();
      setRemainingIncome(parseFloat(income).toFixed(2)); // Round off to two decimal places
      console.log('--------------------------------------------------------');
      console.log('remainingIncome is ' + parseFloat(income).toFixed(2));
    } catch (error) {
      console.error("Error fetching remaining income:", error);
    }
  }; 

  useEffect(() => {     
      
      fetchRemainingIncome();
      
    }, [refresh]); 

  useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
          if (nextAppState === 'active') {
            // App has come to the foreground, refresh data
            fetchRemainingIncome();
          }
        });
    
        return () => {
          subscription.remove();
        };
   }, []);


  return (
    <View style={[styles.container, shadowVisible && styles.shadow]}>
      {/* Main Content Section */}
      <TouchableOpacity
        style={[styles.cardContainer]}        
      >
        <View style={styles.textContainer}>
          {/* Left Side: Title and Amount */}
          <View style={styles.leftContainer}>
            <Text style={styles.budgetName} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.jobType}>                
                <Text style={styles.remainingAllocation}> {incomeAmt}</Text>
            </Text>
            <Text style={styles.jobType}>
                Date Added: 
                <Text style={styles.dateCreated}> {formatDate(dateCreated)}</Text>
            </Text>
            
          </View>

          {/* Right Side: Icons */}
          <View style={styles.rightContainer}>
            {/* Edit Button */}
            <TouchableOpacity onPress={() =>{
                 setModalVisible(true);
                 handleAmountChange(incomeAmt);
                 setRefresh(!refresh);
            }}>
              <Image
                source={icons.pencil}
                resizeMode="contain"
                style={styles.likeBtnImage}
              />
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity onPress={() => {  
                  // refreshIncomeList(prev => !prev); 
                  // setRefresh(!refresh);         
                  handleDelete();
            }}>
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
            
            <TextInput
              style={styles.input}
              placeholder="Amount"
              value={amount}
              onChangeText={handleAmountChange} // Update state with validated input value
              keyboardType="numeric"
            />

            
             <Text style={styles.possibleRemainingIncome}>
                Expected Remaining Income: <Text style={styles.possibleRemainingIncomeAmount}>{possibleRemainingIncome}</Text>
             </Text>
                

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
                onPress={() => setModalVisible(false)}
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
                onPress={proceedDelete}
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
    </View>
    
  );
};

export default Income_card;