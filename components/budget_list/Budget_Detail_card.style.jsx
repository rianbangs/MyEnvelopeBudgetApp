import { StyleSheet } from "react-native";
import { COLORS, SHADOWS, SIZES } from "../../constants";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    padding: SIZES.medium,
    borderRadius: SIZES.small,
    backgroundColor: "#FFF",
    ...SHADOWS.medium,
    shadowColor: COLORS.white,
    width: '90%',
    alignSelf: 'center',
  },
  expenseBackground: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    padding: SIZES.medium,
    borderRadius: SIZES.small,
    backgroundColor: "pink",
    ...SHADOWS.medium,
    shadowColor: COLORS.white,
    width: '90%',
    alignSelf: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  leftContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetName: {
    fontSize: SIZES.medium,
    fontFamily: "DMBold",
    color: COLORS.primary,
  },
  jobType: {
    fontSize: SIZES.small + 2,
    fontFamily: "DMRegular",
    color: COLORS.gray,
    marginTop: 3,
    textTransform: "capitalize",
  },
  remainingAllocation: {
    fontWeight: 'bold', // Example style, customize as needed
    color: 'green', // Example color, customize as needed
  },
  dateCreated: {
    fontWeight: 'bold', // Example style, customize as needed
    color: 'blue', // Example color, customize as needed
  },
  likeBtnImage: {
    width: 50, // Increased width
    height: 50, // Increased height
    marginLeft: SIZES.small,
  },
  shadow: {
    ...SHADOWS.medium,
    shadowColor: COLORS.black,
  },
  card: {
    flex: 1,
    margin: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  remainingAllocation: {
    fontSize: 16,
    color: 'green',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  // buttonText: {
  //   color: 'white',
  //   fontWeight: 'bold',
  // },
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
  addButton: {
    alignSelf: 'center',
    backgroundColor: "green",
    padding: 12,
    borderRadius: 12,
    marginVertical: 12,
  },
  possibleRemainingIncome: {
    fontSize: 16, // Font size
    fontWeight: 'bold', // Bold font weight
    color: 'red', // Text color
    marginTop: -10, // Margin top for spacing
    marginBottom:20,
  },
  possibleRemainingIncomeAmount: {
    fontSize: 16, // Font size
    fontWeight: 'bold', // Bold font weight
    color: 'blue', // Text color
    marginTop: 1, // Margin top for spacing
  },
  possibleRemainingAllocation: {
    fontSize: 16, // Font size
    fontWeight: 'bold', // Bold font weight
    color: 'purple', // Text color
    marginTop: -10, // Margin top for spacing
    marginBottom:20,
  },
  possibleRemainingAllocationAmount: {
    fontSize: 16, // Font size
    fontWeight: 'bold', // Bold font weight
    color: 'green', // Text color
    marginTop: 1, // Margin top for spacing
  },
});

export default styles;