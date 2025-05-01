import React, { useEffect, useState } from "react";
import { Text, FlatList, TouchableOpacity, Modal } from "react-native";
import {
  databases,
  DATABASE_ID,
  INVENTORY_ITEM_COLLECTION_ID,
} from "../../lib/appwrite";
import InventoryItem from "../../components/InventoryItem";
import AddItemForm from "../../components/AddItemForm";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import EditItemForm from "../../components/EditItemForm";

interface InventoryItemType {
  $id: string;
  name: string;
  barcode?: string;
  expiry_date: string;
  date_type: "use_by" | "best_before";
  quantity: number;
  is_frozen: boolean;
  is_removed: boolean;
  removal_reason?: "consumed" | "expired" | "preference" | "other";
}

const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItemType[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string>("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          INVENTORY_ITEM_COLLECTION_ID
        );
        setInventory(response.documents as unknown as InventoryItemType[]);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };

    fetchInventory();
  }, []);

  const handleEdit = (itemId: string) => {
    setCurrentItemId(itemId);
    setEditModalVisible(true);
  };

  return (
    <SafeAreaView className="bg-white h-full p-4">
      <Text className="text-2xl font-bold text-gray-800 text-center mb-4">
        Inventory
      </Text>
      <TouchableOpacity
        className="bg-primary-300 py-3 rounded-lg items-center mb-4"
        onPress={() => setAddModalVisible(true)}
      >
        <Text className="text-white text-lg font-bold">Add New Item</Text>
      </TouchableOpacity>

      <FlatList
        data={inventory}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <InventoryItem
            $id={item.$id}
            name={item.name}
            quantity={item.quantity}
            expiryDate={item.expiry_date}
            isFrozen={item.is_frozen}
            onEdit={() => handleEdit(item.$id)} // Pass itemId to edit handler
          />
        )}
      />

      {/* Modal for Adding New Item */}
      <Modal visible={addModalVisible} animationType="slide" transparent={true}>
        <AddItemForm setModalVisible={setAddModalVisible} />
      </Modal>

      {/* Modal for Editing Item */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <EditItemForm
          setModalVisible={setEditModalVisible}
          itemId={currentItemId} // Pass the itemId to the EditForm
        />
      </Modal>

      <TouchableOpacity onPress={() => router.push("/inventory")}>
        <Text className="text-base font-bold text-primary-300 text-center mt-4">
          Refresh Inventory
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(root)/(tabs)")}>
        <Text className="text-base font-bold text-primary-300 text-center mt-4">
          Go to Hub
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Inventory;
