import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { Image } from "react-native";
import { useRouter } from "expo-router";
import icons from "@/constants/icons";
import { databases, DATABASE_ID, LIST_ITEMS_COLLECTION_ID } from "@/lib/appwrite";
import { ListItem } from "@/lib/types";

const ShoppingList = () => {
  const router = useRouter();
  const [shoppingList, setShoppingList] = useState<ListItem[]>([]);
  const [newItem, setNewItem] = useState<string>("");

  const fetchShoppingList = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        LIST_ITEMS_COLLECTION_ID
      );
  
      // Explicitly cast the response as ListItem[] from unknown to account in a rough way for overlapping types  
      const items = response.documents as unknown as ListItem[];
  
      setShoppingList(items);
    } catch (error) {
      console.error("Error fetching shopping list:", error);
    }
  };
  

  // Add new item to the shopping list
  const addItem = async () => {
    if (newItem.trim() === "") return;
  
    const newItemObject: Partial<ListItem> = {
      name: newItem,
      is_purchased: false,
      quantity: 1,
    };
  
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        LIST_ITEMS_COLLECTION_ID,
        "unique()",
        newItemObject
      );
  
      // Explicitly cast as ListItem before adding to the state
      setShoppingList((prevList) => [...prevList, response as unknown as ListItem]);
      setNewItem("");
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };
  

  // Delete a specific item
  const deleteItem = async (itemId: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, LIST_ITEMS_COLLECTION_ID, itemId);
      setShoppingList((prevList) => prevList.filter((item) => item.$id !== itemId));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Toggle item checked state
  const toggleChecked = async (id: string) => {
    const updatedList = shoppingList.map((item) =>
      item.$id === id ? { ...item, is_purchased: !item.is_purchased } : item
    );
    setShoppingList(updatedList);

    const updatedItem = updatedList.find((item) => item.$id === id);
    if (updatedItem) {
      try {
        await databases.updateDocument(
          DATABASE_ID,
          LIST_ITEMS_COLLECTION_ID,
          id,
          { is_purchased: updatedItem.is_purchased }
        );
      } catch (error) {
        console.error("Error updating item status:", error);
      }
    }
  };

  // Delete all items
  const deleteList = async () => {
    Alert.alert(
      "Delete All Items?",
      "This will permanently remove all items from your shopping list.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await Promise.all(
                shoppingList.map((item) =>
                  databases.deleteDocument(DATABASE_ID, LIST_ITEMS_COLLECTION_ID, item.$id)
                )
              );
              setShoppingList([]);
            } catch (error) {
              console.error("Error deleting list:", error);
            }
          },
        },
      ]
    );
  };

  // Delete only checked items
  const deleteCheckedItems = async () => {
    const checkedItems = shoppingList.filter((item) => item.is_purchased);

    if (checkedItems.length === 0) {
      Alert.alert("No checked items", "There are no checked items to delete.");
      return;
    }

    Alert.alert(
      "Delete Checked Items?",
      "This will permanently remove all checked items from your shopping list.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await Promise.all(
                checkedItems.map((item) =>
                  databases.deleteDocument(DATABASE_ID, LIST_ITEMS_COLLECTION_ID, item.$id)
                )
              );
              setShoppingList((prevList) => prevList.filter((item) => !item.is_purchased));
            } catch (error) {
              console.error("Error deleting checked items:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        <TouchableOpacity onPress={() => router.push("/(root)/(tabs)")} style={styles.navButton}>
          <Text style={styles.navButtonText}>Back to Hub</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/inventory")} style={styles.navButton}>
          <Text style={styles.navButtonText}>Check Inventory</Text>
        </TouchableOpacity>
      </View>

      {/* Shopping List */}
      <FlatList
        data={shoppingList}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <TouchableOpacity onPress={() => toggleChecked(item.$id)}>
              <View
                style={[styles.checkbox, item.is_purchased && styles.checked]}
              />
            </TouchableOpacity>
            <Text style={[styles.itemText, item.is_purchased && styles.strikethrough]}>
              {item.name}
            </Text>
            <TouchableOpacity onPress={() => deleteItem(item.$id)}>
              <Image source={icons.trash} style={styles.trashIcon} />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.$id}
        ListFooterComponent={
          <View style={styles.footer}>
            <TextInput
              style={styles.input}
              placeholder="Add a new item..."
              value={newItem}
              onChangeText={setNewItem}
              onSubmitEditing={addItem}
            />
            <TouchableOpacity onPress={addItem} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Control Buttons */}
      <View style={styles.controlButtons}>
        <TouchableOpacity onPress={deleteList} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Delete List</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={deleteCheckedItems} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Delete Checked Items</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  navButtons: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  navButton: { backgroundColor: "#4caf50", padding: 12, borderRadius: 8 },
  navButtonText: { color: "#fff", fontWeight: "bold" },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderRadius: 5, borderColor: "#4caf50" },
  checked: { backgroundColor: "#4caf50" },
  itemText: { flex: 1, marginLeft: 10, fontSize: 16 },
  strikethrough: { textDecorationLine: "line-through", color: "#aaa" },
  trashIcon: { width: 20, height: 20 },
  footer: { flexDirection: "row", marginTop: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 5 },
  addButton: { backgroundColor: "#4caf50", padding: 12, borderRadius: 5 },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  controlButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  deleteButton: { backgroundColor: "#e74c3c", padding: 12, borderRadius: 5 },
  deleteButtonText: { color: "#fff", fontWeight: "bold" },
});

export default ShoppingList;
