import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  Modal,
  StyleSheet,
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
    <SafeAreaView
      style={{
        margin: 1,
        padding: 20,
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
        flex: 1,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#333",
          marginBottom: 10,
        }}
      >
        Edit Item
      </Text>

      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontSize: 16, color: "#666", marginBottom: 5 }}>
          Item Name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          maxLength={50}
          placeholder="Enter item name"
          placeholderTextColor={"#666"}
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            padding: 10,
            fontSize: 16,
            backgroundColor: "#fff",
          }}
        />
      </View>

      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontSize: 16, color: "#666", marginBottom: 5 }}>
          Expiry Date
        </Text>
        <TouchableOpacity
          onPress={() => setIsDatePickerVisible(true)}
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            padding: 10,
            backgroundColor: "#fff",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 16, color: "#333" }}>
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

      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontSize: 16, color: "#666", marginBottom: 5 }}>
          Date Type
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            onPress={() => setDateType("use_by")}
            style={{
              backgroundColor: dateType === "use_by" ? "#00BFAE" : "#fff",
              padding: 10,
              borderRadius: 8,
              borderColor: "#ddd",
              borderWidth: 1,
              flex: 1,
              marginRight: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: dateType === "use_by" ? "#fff" : "#00BFAE",
              }}
            >
              Use By
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDateType("best_before")}
            style={{
              backgroundColor: dateType === "best_before" ? "#00BFAE" : "#fff",
              padding: 10,
              borderRadius: 8,
              borderColor: "#ddd",
              borderWidth: 1,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: dateType === "best_before" ? "#fff" : "#00BFAE",
              }}
            >
              Best Before
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontSize: 16, color: "#666", marginBottom: 5 }}>
          Quantity
        </Text>
        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          maxLength={4}
          placeholder="Enter quantity"
          placeholderTextColor={"#666"}
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            padding: 10,
            fontSize: 16,
            backgroundColor: "#fff",
          }}
        />
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            backgroundColor: "#00BFAE",
            padding: 15,
            borderRadius: 8,
            flex: 1,
            marginRight: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
            Update Item
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBackPress}
          style={{
            backgroundColor: "#ddd",
            padding: 15,
            borderRadius: 8,
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#333", fontSize: 16, fontWeight: "bold" }}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EditItemForm;
