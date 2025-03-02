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
import BarcodeScanner from "./BarcodeScanner";

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

    // Update the state of the fields with product data
    if (productData) {
      setName(productData.name || "");
      setDateType(productData.dateType || "use_by");
      setFrozen(productData.isFrozen || false);
    }
  };

  const handleSubmit = async () => {
    if (!inventoryId || !userId) {
      Alert.alert("Error", "Missing required data");
      return;
    }
    if (!name || !date || !dateType || !quantity) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      const expiryDate = new Date(date);
      if (isNaN(expiryDate.getTime())) {
        Alert.alert("Error", "Invalid date value, ensure it is YYYY-MM-DD");
        return;
      }
      await databases.createDocument(
        DATABASE_ID,
        INVENTORY_ITEM_COLLECTION_ID,
        "unique()",
        {
          inventory_id: inventoryId,
          name,
          expiry_date: expiryDate.toISOString(),
          date_type: dateType,
          quantity: parseInt(quantity),
          is_frozen: frozen,
          is_removed: false,
          barcode: scannedBarcodeData || null, // Store the barcode data
        }
      );
      Alert.alert("Success", "Item added successfully!");
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
    <SafeAreaView
      style={{
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
        Add Item
      </Text>

      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        style={{
          padding: 15,
          borderRadius: 8,
          backgroundColor: "#00BFAE",
          marginTop: 10,
          marginBottom: 15,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <Text style={{ fontSize: 16, color: "#fff", fontWeight: "bold" }}>
          Scan Barcode
        </Text>
        {scannedBarcodeData ? (
          <Text style={{ fontSize: 14, color: "#fff", marginLeft: 8 }}>
            • Scanned
          </Text>
        ) : null}
      </TouchableOpacity>

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
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
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
              backgroundColor: dateType === "best_before" ? "#FF6F61" : "#fff",
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
                color: dateType === "best_before" ? "#fff" : "#FF6F61",
              }}
            >
              Best Before
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontSize: 16, color: "#666", marginBottom: 5 }}>
          Frozen Item?
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            onPress={() => setFrozen(false)}
            style={{
              backgroundColor: frozen === false ? "#00BFAE" : "#fff",
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
                color: frozen === false ? "#fff" : "#00BFAE",
              }}
            >
              No
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFrozen(true)}
            style={{
              backgroundColor: frozen === true ? "#FF6F61" : "#fff",
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
                color: frozen === true ? "#fff" : "#FF6F61",
              }}
            >
              Yes
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
          style={[styles.button, styles.cancelButton]}
          onPress={handleBackPress}
        >
          <Text style={[styles.buttonText, styles.cancelButtonText]}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.button, styles.submitButton]}
        >
          <Text style={styles.buttonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isModalVisible} animationType="slide" transparent={false}>
        <BarcodeScanner
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          onBarcodeScanned={handleBarcodeScanned}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "#f9f9f9",
    paddingTop: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  formContent: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 20,
  },
  button: {
    marginVertical: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#00BFAE",
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#00BFAE",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#00BFAE",
  },
});

export default AddItemForm;
