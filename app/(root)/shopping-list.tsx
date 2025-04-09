import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import icons from "@/constants/icons";
import {
  databases,
  DATABASE_ID,
  LIST_ITEMS_COLLECTION_ID,
  getCurrentUserId,
  getOrCreateShoppingListForCurrentUser,
} from "@/lib/appwrite";
import { ListItem } from "@/lib/types";
import { Query } from "react-native-appwrite";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'VirtualizedLists should never be nested', // suppressing the warning about the flatlist being in a scrollview
]);

const ShoppingList = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [shoppingList, setShoppingList] = useState<ListItem[]>([]);
  const [newItem, setNewItem] = useState<string>("");
  const [shoppingListId, setShoppingListId] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = await getCurrentUserId();
      if (userId) {
        setUserId(userId);
        const shoppingListId = await getOrCreateShoppingListForCurrentUser();
        setShoppingListId(shoppingListId);
      } else {
        Alert.alert("Error", "User not logged in");
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchShoppingListItems = async () => {
      if (!shoppingListId) return;

      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          LIST_ITEMS_COLLECTION_ID,
          [Query.equal("list_id", shoppingListId)]
        );

        if (response.documents.length > 0) {
          setShoppingList(response.documents as unknown as ListItem[]);
        } else {
          setShoppingList([]);
        }
      } catch (error) {
        console.error("Error fetching shopping list items:", error);
      }
    };

    fetchShoppingListItems();
  }, [shoppingListId]);

  const addItem = async () => {
    if (newItem.trim() === "") return;

    const newItemObject: Partial<ListItem> = {
      name: newItem,
      is_purchased: false,
      quantity: 1,
      list_id: shoppingListId,
    };

    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        LIST_ITEMS_COLLECTION_ID,
        "unique()",
        newItemObject
      );
      setShoppingList((prevList) => [
        ...prevList,
        response as unknown as ListItem,
      ]);
      setNewItem("");
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        LIST_ITEMS_COLLECTION_ID,
        itemId
      );
      setShoppingList((prevList) =>
        prevList.filter((item) => item.$id !== itemId)
      );
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

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
                  databases.deleteDocument(
                    DATABASE_ID,
                    LIST_ITEMS_COLLECTION_ID,
                    item.$id
                  )
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
                  databases.deleteDocument(
                    DATABASE_ID,
                    LIST_ITEMS_COLLECTION_ID,
                    item.$id
                  )
                )
              );
              setShoppingList((prevList) =>
                prevList.filter((item) => !item.is_purchased)
              );
            } catch (error) {
              console.error("Error deleting checked items:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-5">
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}  // Enable keyboard handling on Android
        keyboardShouldPersistTaps="handled"  // Close keyboard when tapping on other parts of the screen
      >
      <View className="mx-3">
        <View className="flex-row justify-between items-center mb-6">
          <Image source={icons.wallet} className="w-8 h-8" />
          <Text className="text-2xl font-rubik-semibold text-black">
            Shopping List
          </Text>
        </View>

        <FlatList
          data={shoppingList}
          renderItem={({ item }) => (
            <View className="flex-row items-center py-4 border-b border-primary-100">
              <TouchableOpacity onPress={() => toggleChecked(item.$id)}>
                <View
                  className={`w-6 h-6 border-2 rounded-md ${
                    item.is_purchased ? "bg-primary-300" : "border-primary-200"
                  }`}
                />
              </TouchableOpacity>
              <Text
                className={`flex-1 ml-4 text-lg ${
                  item.is_purchased
                    ? "line-through text-primary-200"
                    : "text-black"
                }`}
              >
                {item.name}
              </Text>
              <TouchableOpacity onPress={() => deleteItem(item.$id)}>
                <Image source={icons.trash} className="w-6 h-6" />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.$id}
          ListFooterComponent={
            <View className="flex-row mt-6 items-center">
              <TextInput
                className="flex-1 p-3 border rounded-md border-primary-200"
                placeholder="Add a new item..."
                value={newItem}
                onChangeText={setNewItem}
                onSubmitEditing={addItem}
              />
              <TouchableOpacity
                onPress={addItem}
                className="ml-4 px-4 py-2 bg-primary-300 rounded-md"
              >
                <Text className="text-white font-semibold">Add</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <View className="flex-row justify-between mt-6">
          <TouchableOpacity
            onPress={deleteList}
            className="bg-danger px-4 py-2 rounded-md"
          >
            <Text className="text-white font-semibold">Delete List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={deleteCheckedItems}
            className="bg-danger px-4 py-2 rounded-md"
          >
            <Text className="text-white font-semibold">
              Delete Checked Items
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.push("/(root)/(tabs)")}>
          <Text className="text-base font-bold text-primary-300 text-center mt-4">
            Go to Hub
          </Text>
        </TouchableOpacity>
      </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ShoppingList;
