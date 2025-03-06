import React, { useState, useCallback, useEffect } from 'react'; 
import { Text, View, SafeAreaView, TouchableOpacity, Modal, Image, ActivityIndicator, AppState, StatusBar, Platform } from 'react-native';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as DB from './database/envelopeDB';
import Budget_list from './components/budget/Budget_list';
import Footer from './components/footer/Footer';
import Income_list from './components/income/Income_list';
import Budget_Detail_list from './components/budget_list/Budget_Detail_list';
import About from './components/about/About';
import { icons } from './constants/index.js';
import styles from './styles';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing'; 
import * as Updates from 'expo-updates'; 

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation, initializedDB, setInitializedDB }) { 
  const [refresh, setRefresh] = useState(false); // Refresh trigger state 
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(''); 

  async function exportData() {
    try {
      const envelopes = await DB.selectEnvelope();
      const incomes = await DB.selectIncome();
      const envelopeDetails = await DB.selectAllEnvelopeDetails();
  
      const data = {
        envelopes,
        incomes,
        envelopeDetails,
      };
  
      const json = JSON.stringify(data);
  
      // Get the current date
      const date = new Date();
      const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      const fileName = `Backup-envelope-budget-app-${formattedDate}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
  
      await FileSystem.writeAsStringAsync(fileUri, json);
      console.log('Data exported to:', fileUri);

      // Share the file to let the user choose where to save it
      await Sharing.shareAsync(fileUri);
      setNotificationMessage('Data exported successfully');
      setNotificationVisible(true);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  }

  async function importData() {
    try {
      // Clear all existing data
      await DB.clearAllData();
  
      // Use DocumentPicker to let the user choose a file to import
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
  
      console.log('DocumentPicker result:', result);
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        console.log('File URI:', fileUri);
  
        const json = await FileSystem.readAsStringAsync(fileUri);
        const data = JSON.parse(json);
  
        for (const envelope of data.envelopes) {
          await DB.ImportinsertEnvelope(envelope.id,envelope.name, envelope.dateAdded);
        }
  
        for (const income of data.incomes) {
          await DB.insertIncome(income.amount, income.date, income.detail);
        }
  
        for (const detail of data.envelopeDetails) {
          console.log(detail);
          await DB.insertEnvelopeDetail(detail.description, detail.type, detail.amount, detail.date, detail.envId);
        }
  
        console.log('Data imported successfully');
        setNotificationMessage('Data imported successfully');
        setNotificationVisible(true);
      } else {
        console.log('Import canceled');
      }
    } catch (error) {
      console.error('Error importing data:', error);
    }
  }

  const handleNotificationOk = async () => {
    console.log('Restarting app..');
    setNotificationVisible(false); // Close notification modal
    await Updates.reloadAsync(); // Reload the app using Updates module
  };

  useFocusEffect(
    useCallback(() => {
      // Trigger refresh when the screen comes into focus
      setRefresh(prev => !prev);
    }, [])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // App has come to the foreground, refresh data
        setRefresh(prev => !prev);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 10 }}>
          <TouchableOpacity 
            onPress={() => {
              console.log('Navigating to About');
              navigation.navigate('About');
            }}
          >
            <Image
              source={icons.share}
              resizeMode="contain"
              style={styles.likeBtnImage}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={exportData}
            style={{ marginLeft: 10 }}
          >
            <Image
              source={icons.upload}
              resizeMode="contain"
              style={styles.likeBtnImage}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={importData}
            style={{ marginLeft: 10 }}
          >
            <Image
              source={icons.import_Data}
              resizeMode="contain"
              style={styles.likeBtnImage}
            />
          </TouchableOpacity>
        </View>
        <Budget_list 
          refresh={refresh} 
          initializedDB={initializedDB}
          setInitializedDB={setInitializedDB}
        />       
        <Footer 
          style={{ flexShrink: 0 }} 
          refresh={refresh}
          initializedDB={initializedDB}
          setInitializedDB={setInitializedDB}
        />
      </View>     
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
}

export default function App() {
  const navigationRef = React.useRef(null);
  const [initializedDB, setInitializedDB] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      await DB.initDB(); // Initialize the database
      setInitializedDB(true);
    };
    initializeDatabase();
  }, []); // Empty dependency array ensures this runs only once

  if (!initializedDB) {
    // Show a loading indicator while the database is being initialized
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* <Text>Initializing app, please wait..</Text> */}
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor="green" barStyle="light-content" /> {/* Set status bar background color and content color */}
      <NavigationContainer ref={navigationRef}> 
        <Stack.Navigator>
          <Stack.Screen 
            name="Home" 
            options={{
              headerShadowVisible: true,
              headerTitle: "Budget List",
              headerStyle: { backgroundColor: 'green' }, // Set header background color to black
              headerTitleStyle: { color: 'white' }, // Set header title font color to white
              headerTintColor: 'white', // Set back arrow color to white
            }}
          >
            {(props) => <HomeScreen {...props} initializedDB={initializedDB} setInitializedDB={setInitializedDB} />}
          </Stack.Screen>
          <Stack.Screen 
            name="IncomeList"
            options={{
              headerShadowVisible: true,
              headerTitle: "Income List",
              headerStyle: { backgroundColor: 'green' }, // Set header background color to black
              headerTitleStyle: { color: 'white' }, // Set header title font color to white
              headerTintColor: 'white', // Set back arrow color to white
            }}
          >
            {(props) => <Income_list {...props} initializedDB={initializedDB} setInitializedDB={setInitializedDB} />}
          </Stack.Screen>
          <Stack.Screen 
            name="BudgetDetailList"
            options={{
              headerShadowVisible: true,
              headerTitle: "Budget Details",
              headerStyle: { backgroundColor: 'green' }, // Set header background color to black
              headerTitleStyle: { color: 'white' }, // Set header title font color to white
              headerTintColor: 'white', // Set back arrow color to white
            }}
          >
            {(props) => <Budget_Detail_list {...props} initializedDB={initializedDB} setInitializedDB={setInitializedDB} />}
          </Stack.Screen>
          <Stack.Screen
            name="About"
            options={{
              headerShadowVisible: true,
              headerTitle: "About",
              headerStyle: { backgroundColor: 'green' }, // Set header background color to black
              headerTitleStyle: { color: 'white' }, // Set header title font color to white
              headerTintColor: 'white', // Set back arrow color to white
            }}
          >
            {(props) => <About {...props} initializedDB={initializedDB} setInitializedDB={setInitializedDB} />}
          </Stack.Screen>
          {/* Add more screens here */}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}