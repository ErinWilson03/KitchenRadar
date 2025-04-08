import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";

interface DatePickerProps {
  date: string;
  onDateChange: (formattedDate: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  date,
  onDateChange,
  isVisible,
  onClose,
}) => {
  // Convert YYYY-MM-DD to DD-MM-YYYY for UI display only
  const formatDateForDisplay = (date: string) => {
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleDateChange = (selectedDate: string) => {
    onDateChange(selectedDate);
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Pick Expiry Date</Text>
          <Calendar
            current={date} // The current date passed in is in DD-MM-YYYY
            onDayPress={(day: { dateString: string }) =>
              handleDateChange(day.dateString) // Use the date in YYYY-MM-DD format for Appwrite's benefit
            }
            markedDates={{
              [date]: {
                selected: true,
                selectedColor: "#00BFAE",
                selectedTextColor: "#fff",
              },
            }}
          />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Transparent background
  },
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: 350,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#00BFAE",
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DatePicker;
