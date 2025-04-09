import {
  DATABASE_ID,
  databases,
  getCurrentUserId,
  getOrCreateShoppingListForCurrentUser,
  INVENTORY_ITEM_COLLECTION_ID,
  LIST_ITEMS_COLLECTION_ID,
} from "@/lib/appwrite";
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

interface ItemDeletionModalProps {
  visible: boolean;
  itemName: string;
  itemId: string;
  onCancel: () => void;
}

const ItemDeletionModal: React.FC<ItemDeletionModalProps> = ({
  visible,
  itemName,
  itemId,
  onCancel,
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [listId, setListId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = await getCurrentUserId();
      if (userId) {
        setUserId(userId);
        const listId = await getOrCreateShoppingListForCurrentUser();
        setListId(listId);
      } else {
        Alert.alert("Error", "User not logged in");
      }
    };
    fetchUserData();
  }, []);

  const handleAddAndDelete = async () => {
    try {
      await databases.createDocument(
        DATABASE_ID,
        LIST_ITEMS_COLLECTION_ID,
        "unique()",
        {
          list_id: listId,
          name: itemName,
          quantity: 1,
          is_purchased: false,
        }
      );
      await handleDelete();
    } catch (error) {
      console.error("Error adding item:", error);
      Alert.alert("Error", "Failed to add item to shopping list");
    }
  };

  const handleDelete = async () => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        INVENTORY_ITEM_COLLECTION_ID,
        itemId
      );
      Alert.alert("Success", "Item deleted successfully!");
      onCancel(); // using the parent handler to close modal
    } catch (error) {
      console.error("Error deleting item:", error);
      Alert.alert("Error", "Failed to delete item");
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Delete Item</Text>
          <Text style={styles.message}>
            Would you like to add "{itemName}" to your shopping list?
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={handleAddAndDelete}
            >
              <Text style={styles.buttonText}>Yes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleDelete}
            >
              <Text style={styles.buttonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
  },
  button: {
    width: 100,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ItemDeletionModal;
