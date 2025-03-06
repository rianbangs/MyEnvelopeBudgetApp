import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, AppState } from "react-native";
import { useNavigation } from '@react-navigation/native';
import styles from "./footer.style";
import * as DB from '../../database/envelopeDB'; // Import the function

DB.getRemainingIncome(); // Call the function
const Footer = ({ showManageIncomeButton = true,refresh,envId,initializedDB,setInitializedDB }) => {
  //console.log("Envelope ID passed to the footer:", envId);
  const navigation = useNavigation();
  const [remainingIncome, setRemainingIncome] = useState(0); // State to store remaining income
  const [remainingAllocation, setRemainingAllocation] = useState(0); // State to store remaining allocation
   
  const fetchRemainingIncome = async () => {
    try {
      const income = await DB.getRemainingIncome();   
      if(income == null){
        setRemainingIncome(0.00);
      }
      else 
      {
        setRemainingIncome(parseFloat(income).toFixed(2));
      }       
       
       // Round off to two decimal places
    } catch (error) {    
      // setNotificationMessage('Error fetching remaining income:');
      // setNotificationVisible(true);
      console.error("Error fetching remaining income:", error);
    }
  };

   


  const fetchRemainingAllocation = async () => {
    try {
      const allocation = await DB.getRemainingAllocation(envId);
      // console.log("Total Allocation for this budget: ", allocation);
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
    console.log("initializedDB in footer:----->", initializedDB);
    fetchRemainingAllocation();
    fetchRemainingIncome();
  },  [refresh]); // Re-fetch remaining income when refresh prop changes

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
      
   <View style={styles.parentContainer}>
      {envId && (
        <View style={styles.footerContainer}>
        <Text style={styles.headerTitle}>Remaining Allocation</Text>
        <TouchableOpacity style={styles.likeBtn}>
          <Text style={styles.likeBtnText}>{remainingAllocation}</Text>
        </TouchableOpacity>
      </View>
      )}     

      <View style={styles.container}>
        <Text style={styles.headerTitle}>Remaining Income</Text>
        <TouchableOpacity style={styles.likeBtn}>
          <Text style={styles.likeBtnText}>{remainingIncome}</Text>
        </TouchableOpacity>
        {showManageIncomeButton && (
          <TouchableOpacity 
            style={styles.applyBtn} 
            onPress={() => navigation.navigate('IncomeList', { initializedDB, setInitializedDB })} // Navigate to IncomeList screen with props
          >
            <Text style={styles.applyBtnText}>Manage Income</Text>
          </TouchableOpacity>
        )}
      </View>
  </View>
    
  );
};

export default Footer;