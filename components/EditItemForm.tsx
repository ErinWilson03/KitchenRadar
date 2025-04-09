import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  Modal,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import {
  DATABASE_ID,
  databases,
  getCurrentUserId,
  getOrCreateInventoryForCurrentUser,
  INVENTORY_ITEM_COLLECTION_ID,
} from "../lib/appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
import DatePicker from "./DatePicker"; // Import DatePicker Component
import format from "date-fns/format";
import icons from "@/constants/icons";

interface EditItemFormProps {
  setModalVisible: (visible: boolean) => void;
  itemId: string; // Item ID to fetch data for
}

const EditItemForm: React.FC<EditItemFormProps> = ({
  setModalVisible,
  itemId,
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [inventoryId, setInventoryId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [dateType, setDateType] = useState("use_by"); // Default value
  const [quantity, setQuantity] = useState("");
  const [frozen, setFrozen] = useState(false);
  const [scannedBarcodeData, setScannedBarcodeData] = useState<string>("");

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false); // Manage date picker visibility

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = await getCurrentUserId();
      if (userId) {
        setUserId(userId);
        const invId = await getOrCreateInventoryForCurrentUser();
        setInventoryId(invId);

        // Fetch the item data to populate the form
        try {
          console.log("Item Id found: ", itemId);

          const item = await databases.getDocument(
            DATABASE_ID,
            INVENTORY_ITEM_COLLECTION_ID,
            itemId
          );

          setName(item.name || "");
          setDate(item.expiry_date || "");
          setDateType(item.date_type || "use_by");
          setQuantity(item.quantity?.toString() || "");
          setFrozen(item.is_frozen || false);
          setScannedBarcodeData(item.barcode || "");
        } catch (error) {
          console.error("Error fetching item data:", error);
          Alert.alert("Error", "Failed to fetch item data.");
        }
      } else {
        Alert.alert("Error", "User not logged in");
      }
    };
    fetchUserData();
  }, [itemId]);

  const formatDateForDisplay = (date: string) => {
    const parsedDate = new Date(date); // Convert the ISO string to a Date object
    return format(parsedDate, "dd-MM-yyyy"); // Format the Date object as "DD-MM-YYYY"
  };

  const handleDateChange = (formattedDate: string) => {
    const [day, month, year] = formattedDate.split("-");
    const backendDate = `${year}-${month}-${day}`;
    setDate(backendDate);
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
      const [day, month, year] = date.split("-");
      const expiryDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

      if (isNaN(expiryDate.getTime())) {
        Alert.alert("Error", "Invalid date value, ensure it is DD-MM-YYYY");
        return;
      }

      const expiryDateIsoString = expiryDate.toISOString();

      await databases.updateDocument(
        DATABASE_ID,
        INVENTORY_ITEM_COLLECTION_ID,
        itemId,
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
      Alert.alert("Success", "Item updated successfully!");

      setName("");
      setDate("");
      setDateType("use_by");
      setQuantity("");
      setScannedBarcodeData("");
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating item:", error);
      Alert.alert("Error", "Failed to update item");
    }
  };

  const handleBackPress = () => {
    setModalVisible(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white p-5 rounded-lg">
        <View className="flex-row justify-between items-center my-6">
          <Image source={icons.edit} className="w-11 h-11" />
          <Text className="text-3xl font-semibold text-primary-300">
            Edit Item
          </Text>
        </View>

        {/* Item Name */}
        <View className="mb-6">
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

        {/* Expiry Date */}
        <View className="mb-6">
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

        <DatePicker
          date={date}
          onDateChange={handleDateChange}
          isVisible={isDatePickerVisible}
          onClose={() => setIsDatePickerVisible(false)}
        />

        {/* Date Type */}
        <View className="mb-6">
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

        {/* Quantity */}
        <View className="mb-6">
          <Text className="text-base text-primary-300 mb-1">Quantity</Text>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            maxLength={4}
            placeholder="Enter quantity"
            placeholderTextColor="#999"
            className="border border-primary-200 rounded-lg p-3 bg-white text-base"
          />
        </View>

        {/* Submit Button */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-primary-300 p-4 rounded-lg flex-1 items-center"
          >
            <Text className="text-white text-base font-semibold">
              Update Item
            </Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={handleBackPress}
            className="bg-gray-200 p-4 rounded-lg flex-1 items-center"
          >
            <Text className="text-gray-800 text-base font-semibold">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default EditItemForm;
