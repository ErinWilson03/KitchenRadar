import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Alert, TouchableOpacity } from "react-native";
import {
  DATABASE_ID,
  databases,
  getCurrentUserId,
  getOrCreateInventoryForCurrentUser,
  INVENTORY_ITEM_COLLECTION_ID,
} from "../lib/appwrite";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const AddItemForm = () => {
  // todo: below line may not be needed 
  const [userId, setUserId] = useState<string | null>(null);
  const [inventoryId, setInventoryId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [dateType, setDateType] = useState("use_by"); // Default value
  const [quantity, setQuantity] = useState("");
  const [frozen, setFrozen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = await getCurrentUserId();
      if (userId) {
        setUserId(userId)
        const invId = await getOrCreateInventoryForCurrentUser();
        setInventoryId(invId);
      } else {
        Alert.alert("Error", "User not logged in");
      }
    };
    fetchUserData();
  }, []);

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
        Alert.alert("Error", "Invalid date value");
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
        }
      );

      Alert.alert("Success", "Item added successfully!");
      setName("");
      setDate("");
      setDateType("use_by");
      setQuantity("");
    } catch (error) {
      console.error("Error adding item:", error);
      Alert.alert("Error", "Failed to add item");
    }
  };

  const navigation = useNavigation(); // Access the navigation object

  // Handle the back button press
  const handleBackPress = () => {
    navigation.goBack(); // Navigate back to the previous screen
  };

  return (
    <SafeAreaView
      style={{ padding: 20, backgroundColor: "#f9f9f9", borderRadius: 10 }}
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

      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          padding: 15,
          borderRadius: 8,
          backgroundColor: "#00BFAE",
          marginTop: 10,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 16, color: "#fff", fontWeight: "bold" }}>
          Add Item
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleBackPress}>
        <Text style={styles.buttonText}>←</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1, // Allow the container to fill the available space
    justifyContent: "flex-start", // Position content at the top of the screen
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
    flex: 1, // This ensures the content can take up remaining space
    justifyContent: "flex-start", // Start positioning content from the top
    paddingHorizontal: 20,
  },
  button: {
    marginVertical: 20, // Ensure it stays above bottom safe area
    padding: 15,
    backgroundColor: "#00BFAE",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default AddItemForm;
