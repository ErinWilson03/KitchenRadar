import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import {
  DATABASE_ID,
  databases,
  getCurrentUserId,
  getOrCreateShoppingListForCurrentUser,
  INVENTORY_ITEM_COLLECTION_ID,
  INVENTORY_LOGS_COLLECTION_ID,
  LIST_ITEMS_COLLECTION_ID,
} from "@/lib/appwrite";
import { ID } from "react-native-appwrite";

interface ItemDeletionModalProps {
  visible: boolean;
  itemName: string;
  itemId: string;
  currentQuantity: number;
  onCancel: () => void;
  onDeleted: () => void; // callback to refresh inventory list
}

const ItemDeletionModal: React.FC<ItemDeletionModalProps> = ({
  visible,
  itemName,
  itemId,
  currentQuantity,
  onCancel,
  onDeleted,
}) => {
  const [quantityToDelete, setQuantityToDelete] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [listId, setListId] = useState<string | null>(null);
  const [removalReason, setRemovalReason] = useState("other"); // we assume here that the user is deleting because of another reason as default

  const isMaxQuantity = quantityToDelete >= currentQuantity;

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
  }, []); // Empty dependency array means this runs only once when component mounts

  useEffect(() => {
    if (visible) {
      setQuantityToDelete(1);
    }
  }, [visible]); // Dependency is 'visible', so this runs when modal is toggled

  const handleDelete = async (addToList: boolean) => {
    try {
      // If we DO want to add the deleted items to the shopping list
      if (addToList && listId) {
        await databases.createDocument(
          DATABASE_ID,
          LIST_ITEMS_COLLECTION_ID,
          "unique()",
          {
            list_id: listId,
            name: itemName,
            quantity: quantityToDelete,
            is_purchased: false,
          }
        );
      }

      // If we're just updating the inventory quantity (not deleting the full quantity of item)
      if (quantityToDelete < currentQuantity) {
        await databases.updateDocument(
          DATABASE_ID,
          INVENTORY_ITEM_COLLECTION_ID,
          itemId,
          {
            quantity: currentQuantity - quantityToDelete,
          }
        );
      } else {
        // If quantity to delete is equal to or more than the available quantity, delete the item entirely
        await databases.deleteDocument(
          DATABASE_ID,
          INVENTORY_ITEM_COLLECTION_ID,
          itemId
        );
      }

      Alert.alert("Success", "Item updated successfully!");
      onDeleted(); // parent handles refresh
    } catch (error) {
      console.error("Deletion error", error);
      Alert.alert("Error", "Something went wrong");
    }

    // Log the deletion reason
    try {
      await databases.createDocument(
        DATABASE_ID,
        INVENTORY_LOGS_COLLECTION_ID,
        "unique()",
        {
          inventory_item_id: itemId,
          action: removalReason,
          quantity: quantityToDelete,
          timestamp: new Date().toISOString(),
        }
      );
      console.log("Item ", itemName, " successfully deleted with reason " + removalReason);
    } catch (error) {
      console.error("Error creating document:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-80 bg-white p-8 rounded-xl items-center">
          <Text className="text-xl font-bold mb-3">Delete Item</Text>
          <Text className="text-base text-center mb-6">
            How many of "{itemName}" would you like to delete?
          </Text>

          <View className="flex-row items-center justify-center mb-6">
            <TouchableOpacity
              onPress={() => setQuantityToDelete((q) => Math.max(1, q - 1))}
            >
              <Text className="text-4xl px-5 text-black">-</Text>
            </TouchableOpacity>
            <TextInput
              className={`w-20 h-12 border text-center text-2xl mx-5 rounded-md flex items-center justify-center ${
                isMaxQuantity
                  ? "border-danger text-danger"
                  : "border-primary-200"
              }`}
              keyboardType="numeric"
              value={quantityToDelete.toString()}
              onChangeText={(text) => {
                const value = parseInt(text);
                if (!isNaN(value) && value > 0 && value <= currentQuantity) {
                  setQuantityToDelete(value);
                }
              }}
            />
            <TouchableOpacity
              onPress={() => {
                if (!isMaxQuantity) {
                  setQuantityToDelete((q) => q + 1);
                }
              }}
              disabled={isMaxQuantity}
            >
              <Text
                className={`text-4xl px-5 ${
                  isMaxQuantity ? "text-primary-200" : "text-black"
                }`}
              >
                +
              </Text>
            </TouchableOpacity>
          </View>

          {isMaxQuantity && (
            <Text className="text-danger text-xs mb-2">
              Max quantity available to delete
            </Text>
          )}

          <View className="w-full border-t border-primary-200 my-3"></View>

          <Text className="text-base text-center mb-2">
            Why are you deleting it?
          </Text>
          <View className="flex-row justify-around mb-4">
            {["consumed", "expired", "preference", "other"].map((reason) => (
              <TouchableOpacity
                key={reason}
                onPress={() => setRemovalReason(reason)}
                className={`px-3 py-1 rounded-full border ${
                  removalReason === reason
                    ? "bg-primary-300 border-primary-300"
                    : "border-primary-200"
                }`}
              >
                <Text
                  className={`${
                    removalReason === reason ? "text-white" : "text-primary-300"
                  }`}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="w-full border-t border-primary-200 my-3"></View>

          <Text className="text-base text-center mb-6">
            Add the deleted items to your shopping list?
          </Text>

          <View className="flex-row w-full justify-around mb-2">
            <TouchableOpacity
              className="w-28 py-3 bg-primary-300 rounded-md items-center"
              onPress={() => {
                onCancel();
                handleDelete(true);
              }}
            >
              <Text className="text-white font-bold">Yes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-28 py-3 bg-danger rounded-md items-center"
              onPress={() => {
                onCancel();
                handleDelete(false);
              }}
            >
              <Text className="text-white font-bold">No</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onCancel} className="mt-6 py-3">
            <Text className="text-primary-300 text-md underline">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ItemDeletionModal;
