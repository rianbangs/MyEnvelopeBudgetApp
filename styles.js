// styles.js
import { StyleSheet } from 'react-native';
import {SIZES } from "./constants";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    width: '90%',
    height: 50,
  }, 
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  notificationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  notificationView: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  notificationText: {
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
   buttonTextBlack: {
    color: 'black',
    fontSize: 16,
  },
  addButton: {
    alignSelf: 'center',
    backgroundColor: "green",
    padding: 12,
    borderRadius: 12,
    marginVertical: 12,
  },
  IncomeAddButton: {
    alignSelf: 'center',
    backgroundColor: "blue",
    padding: 12,
    borderRadius: 12,
    marginVertical: 12,
  },
  IncomeAddEntryButton: {
    alignSelf: 'center',
    backgroundColor: "orange",
    padding: 12,
    borderRadius: 12,
    marginVertical: 12,
  },
  cardsContainer: {
    marginTop: 16,
    gap: 12,
  },
  IncomecardsContainer:  {
    marginTop: 16,
    gap: 12,
    width: '100%'
  },
  headerTitle: {
    fontSize: 24, // Bigger font size
    fontWeight: 'bold', // Bold font weight
    textAlign: 'center', // Center the text
    marginVertical: 20, // Vertical margin for spacing
  },
  possibleRemainingIncome: {
    fontSize: 16, // Font size
    fontWeight: 'bold', // Bold font weight
    color: 'red', // Text color
    marginTop: -20, // Margin top for spacing
    marginBottom:20,
  },
  possibleRemainingAllocation: {
    fontSize: 16, // Font size
    fontWeight: 'bold', // Bold font weight
    color: 'purple', // Text color
    marginTop: -20, // Margin top for spacing
    marginBottom:20,
  },
  possibleRemainingIncomeAmount: {
    fontSize: 16, // Font size
    fontWeight: 'bold', // Bold font weight
    color: 'blue', // Text color
    marginTop: 1, // Margin top for spacing
  },
  possibleRemainingAllocationAmount: {
    fontSize: 16, // Font size
    fontWeight: 'bold', // Bold font weight
    color: 'green', // Text color
    marginTop: 1, // Margin top for spacing
  },
  likeBtnImage: {
    width: 40, // Increased width
    height: 40, // Increased height
    marginLeft: SIZES.small,
  },
  Aboutcontainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  headerText: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
