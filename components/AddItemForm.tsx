import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  Modal,
  Image,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import {
  DATABASE_ID,
  databases,
  getCurrentUserId,
  getOrCreateInventoryForCurrentUser,
  INVENTORY_ITEM_COLLECTION_ID,
  INVENTORY_LOGS_COLLECTION_ID,
} from "../lib/appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
import BarcodeScanner from "./BarcodeScanner";
import DatePicker from "./DatePicker"; // Import DatePicker Component
import icons from "@/constants/icons";

interface AddItemFormProps {
  setModalVisible: (visible: boolean) => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ setModalVisible }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [inventoryId, setInventoryId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [dateType, setDateType] = useState("use_by"); // Default value
  const [quantity, setQuantity] = useState("");
  const [frozen, setFrozen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [scannedBarcodeData, setScannedBarcodeData] = useState<string>("");
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false); // Manage date picker visibility

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = await getCurrentUserId();
      if (userId) {
        setUserId(userId);
        const invId = await getOrCreateInventoryForCurrentUser();
        setInventoryId(invId);
      } else {
        Alert.alert("Error", "User not logged in");
      }
    };
    fetchUserData();
  }, []);

  const handleBarcodeScanned = (data: string, productData: any) => {
    setScannedBarcodeData(data);
    console.log("Scanned barcode data:", data);

    if (productData) {
      setName(productData.name || "");
      setDateType(productData.dateType || "use_by");
      setFrozen(productData.isFrozen || false);
    }
  };

  // Format date for UI display in DD-MM-YYYY format
  const formatDateForDisplay = (date: string) => {
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  };

  // Handle date change, format to YYYY-MM-DD for backend
  const handleDateChange = (formattedDate: string) => {
    const [day, month, year] = formattedDate.split("-");

    const backendDate = `${year}-${month}-${day}`; // YYYY-MM-DD format
    setDate(backendDate); // Store the date in the correct format
    setIsDatePickerVisible(false);
  };

  const handleSubmit = async () => {
    if (!inventoryId || !userId) {
      Alert.alert("Error", "Missing required ID data");
      return;
    }
    if (!name || !date || !dateType || !quantity) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      // Convert the date to an ISO format if needed
      const [day, month, year] = date.split("-");
      const expiryDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

      // Check if the date is valid
      if (isNaN(expiryDate.getTime())) {
        Alert.alert("Error", "Invalid date value, ensure it is DD-MM-YYYY");
        return;
      }

      // Send the correctly formatted date to Appwrite (it expects YYYY-MM-DD format)
      const expiryDateIsoString = expiryDate.toISOString(); // This adds time and UTC info

      //create the document in the db
      const createdItem = await databases.createDocument(
        DATABASE_ID,
        INVENTORY_ITEM_COLLECTION_ID,
        "unique()",
        {
          inventory_id: inventoryId,
          name,
          expiry_date: expiryDateIsoString,
          date_type: dateType,
          quantity: parseInt(quantity),
          is_frozen: frozen,
          is_removed: false,
          barcode: scannedBarcodeData || null,
        }
      );
    
      // use the created document to make a log
      await databases.createDocument(
        DATABASE_ID,
        INVENTORY_LOGS_COLLECTION_ID,
        "unique()",
        {
          inventory_item_id: createdItem.$id,
          action: "added",
          quantity: parseInt(quantity),
          timestamp: new Date().toISOString(),
        }
      );
      
      Alert.alert("Success", "Item added successfully!");

      // Reset the fields
      setName("");
      setDate("");
      setDateType("use_by");
      setQuantity("");
      setScannedBarcodeData("");
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding item:", error);
      Alert.alert("Error", "Failed to add item");
    }
  };

  const handleBackPress = () => {
    setModalVisible(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white p-5 rounded-lg">
        <View className="flex-row justify-between items-center my-6">
          <Image source={icons.grocery} className="w-11 h-11" />
          <Text className="text-3xl font-semibold text-primary-300">
            Add Item
          </Text>
        </View>

        {/* Barcode Scanner */}
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          className="bg-primary-200 py-3 px-4 rounded-lg flex-row justify-center items-center mb-4"
        >
          <Text className="text-white text-base font-bold">Scan Barcode</Text>
          {scannedBarcodeData ? (
            <Text className="text-white text-sm ml-2">• Scanned</Text>
          ) : null}
        </TouchableOpacity>

        {/* Item Name */}
        <View className="mb-4">
          <Text className="text-base text-primary-300 mb-1">Item Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            maxLength={50}
            placeholder="Enter item name"
            placeholderTextColor="#999"
            className="border border-primary-200 rounded-lg p-3 bg-white text-base"
          />
        </View>

        {/* Expiry Date Picker */}
        <View className="mb-4">
          <Text className="text-base text-primary-300 mb-1">Expiry Date</Text>
          <TouchableOpacity
            onPress={() => setIsDatePickerVisible(true)}
            className="border border-primary-200 rounded-lg p-3 bg-white"
          >
            <Text className="text-base text-gray-700">
              {date ? formatDateForDisplay(date) : "DD-MM-YYYY"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker Modal */}
        <DatePicker
          date={date}
          onDateChange={handleDateChange}
          isVisible={isDatePickerVisible}
          onClose={() => setIsDatePickerVisible(false)}
        />

        {/* Date Type */}
        <View className="mb-4">
          <Text className="text-base text-primary-300 mb-1">Date Type</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setDateType("use_by")}
              className={`flex-1 items-center justify-center p-3 rounded-lg border ${
                dateType === "use_by"
                  ? "bg-primary-200 border-transparent"
                  : "bg-white border-primary-300"
              }`}
            >
              <Text
                className={`text-base ${
                  dateType === "use_by" ? "text-white" : "text-primary-500"
                }`}
              >
                Use By
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDateType("best_before")}
              className={`flex-1 items-center justify-center p-3 rounded-lg border ${
                dateType === "best_before"
                  ? "bg-primary-200 border-transparent"
                  : "bg-white border-primary-300"
              }`}
            >
              <Text
                className={`text-base ${
                  dateType === "best_before" ? "text-white" : "text-primary-500"
                }`}
              >
                Best Before
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Frozen Item */}
        <View className="mb-4">
          <Text className="text-base text-primary-300 mb-1">Frozen Item?</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setFrozen(false)}
              className={`flex-1 items-center justify-center p-3 rounded-lg border ${
                frozen === false
                  ? "bg-primary-200 border-transparent"
                  : "bg-white border-primary-200"
              }`}
            >
              <Text
                className={`text-base ${
                  frozen === false ? "text-white" : "text-primary-500"
                }`}
              >
                No
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFrozen(true)}
              className={`flex-1 items-center justify-center p-3 rounded-lg border ${
                frozen === true
                  ? "bg-primary-200 border-transparent"
                  : "bg-white border-primary-200"
              }`}
            >
              <Text
                className={`text-base ${
                  frozen === true ? "text-white" : "text-primary-500"
                }`}
              >
                Yes
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quantity */}
        <View className="mb-6">
          <Text className="text-base text-primary-300 mb-1">Quantity</Text>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholder="Enter quantity"
            placeholderTextColor="#999"
            className="border border-primary-200 rounded-lg p-3 bg-white text-base"
          />
        </View>

        {/* Submit and Cancel Button */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-primary-300 p-4 rounded-lg items-center w-1/2"
          >
            <Text className="text-white text-base font-semibold">Add Item</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBackPress}
            className="bg-gray-200 p-4 rounded-lg flex-1 items-center"
          >
            <Text className="text-gray-800 text-base font-semibold">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        {/* Barcode Modal */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={false}
        >
          <BarcodeScanner
            isModalVisible={isModalVisible}
            setIsModalVisible={setIsModalVisible}
            onBarcodeScanned={handleBarcodeScanned}
          />
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AddItemForm;
