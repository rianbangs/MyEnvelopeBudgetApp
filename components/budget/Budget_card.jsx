import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, Modal, TextInput, AppState } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './Budget_card.style.jsx';
import { icons } from '../../constants/index.js';
import * as DB from '../../database/envelopeDB.js';

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const Budget_card = ({ env_id, title, dateCreated, shadowVisible,setRefresh,initializedDB,setInitializedDB }) => {
  
  const [refreshLocal, setRefreshLocal] = useState(false); // Local refresh state
  const [remainingAllocation, setRemainingAllocation] = useState(0); // Remaining allocation state
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [newTitle, setNewTitle] = useState(title); // New title state
  const [notificationMessage, setNotificationMessage] = useState(''); // Notification message state
  const [notificationVisible, setNotificationVisible] = useState(false); // Notification modal visibility state
  const navigation = useNavigation();
  const [entryUpdate, setEntryUpdate] = useState(false); 
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); // Delete confirmation modal visibility state

  
    const fetchRemainingAllocation = async () => {
      try {
        const allocation = await DB.getRemainingAllocation(env_id);
        //console.log("Total Allocation for this budget: ", allocation);
        if(allocation === null){
          setRemainingAllocation('0.00');
        }else {
          setRemainingAllocation(parseFloat(allocation).toFixed(2));
        }
        
      } catch (error) {
        console.error("Error fetching remaining allocation:", error);
      }
    };

  useEffect(() => {   
    fetchRemainingAllocation();     
  }, [refreshLocal]);

  useEffect(() => {
      const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
           // App has come to the foreground, refresh data
           fetchRemainingAllocation();
        }
      });
  
      return () => {
        subscription.remove();
      };
    }, []);

  const handleUpdateTitle = async () => {
    if (!newTitle) {
      setNotificationMessage('Budget name is required');
      setNotificationVisible(true);
      return; // Exit the function if title is empty
    }   


    try {
      await DB.updateEnvelope(env_id, newTitle); // Assuming you have this function in your DB module
      // setRefreshLocal(!refreshLocal); // Trigger local refresh
      setModalVisible(false); // Close the modal
      setNotificationMessage('Entry updated successfully');
      setNotificationVisible(true); // Show notification modal
      setEntryUpdate(true); 
       
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };


  const handleNotificationOk = () => {
    setNotificationVisible(false); // Close notification modal
    if (entryUpdate) {
      setRefresh(prev => !prev); // Trigger refresh in parent component       
      setEntryUpdate(false); // Reset setEntryUpdate state
    }
  };


   const handleDelete = async () => {
      try {
        await DB.deleteEnvelopeDetailByENV_ID(env_id);
        await DB.deleteEnvelope(env_id);
        //console.log('Entry deleted successfully');
        setNotificationMessage('Entry deleted successfully');
        setNotificationVisible(true); // Show notification modal
        setDeleteModalVisible(false); // Close the delete confirmation modal
        setEntryUpdate(true);
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    };

  return (
    // <View style={[
    //   styles.container,
    //   shadowVisible && styles.shadow,
    //   type === 'Expense' && styles.expenseBackground // Apply pink background if type is Expense
    // ]}></View>


    <View style={[
                    styles.container, 
                    shadowVisible && styles.shadow,
                    remainingAllocation < 0 && styles.negativeBudgetBackground
                    ]}>
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
                Remaining Budget: 
                <Text style={styles.remainingAllocation}> {remainingAllocation}</Text>
            </Text>
            <Text style={styles.jobType}>
                Date Added: 
                <Text style={styles.dateCreated}> {formatDate(dateCreated)}</Text>
            </Text>
          </View>

          {/* Right Side: Icons */}
          <View style={styles.rightContainer}>
            {/* Edit Button */}
            <TouchableOpacity onPress={() => setModalVisible(true)}>
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

            {/* View Details Button */}
            <TouchableOpacity onPress={() => navigation.navigate('BudgetDetailList', { envId: env_id, title: title,refreshBudList:setRefreshLocal,initializedDB:initializedDB,setInitializedDB:setInitializedDB })}>
              <Image
                source={icons.editListIcon}
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
            <Text style={styles.modalText}>Edit Title</Text>
            <TextInput
              style={styles.input}
              placeholder="New Title"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleUpdateTitle}
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

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Are you sure you want to delete  {title}?</Text>
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
    </View>
  );
};

export default Budget_card;