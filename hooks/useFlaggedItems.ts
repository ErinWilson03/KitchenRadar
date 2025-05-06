import { useEffect, useState } from "react";
import {
  databases,
  getCurrentUserId,
  getOrCreateInventoryForCurrentUser,
} from "@/lib/appwrite";
import { DATABASE_ID, INVENTORY_ITEM_COLLECTION_ID } from "@/lib/appwrite";
import { FlaggedItem } from "@/lib/types";
import { Query } from "react-native-appwrite";

export const useFlaggedItems = (daysThreshold = 7) => {
  const [flaggedItems, setFlaggedItems] = useState<FlaggedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpiringItems = async () => {
      try {
        const inventoryId = await getOrCreateInventoryForCurrentUser();
        if (!inventoryId) throw new Error("No inventory ID found");

        const response = await databases.listDocuments(
          DATABASE_ID,
          INVENTORY_ITEM_COLLECTION_ID,
          [Query.equal("inventory_id", inventoryId)] // 👈 Filter by user’s inventory
        );

        const today = new Date();
        const filteredItems = response.documents
          .filter((item) => {
            const expiryDate = new Date(item.expiry_date);
            const daysUntilExpiry =
              (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
            return daysUntilExpiry <= daysThreshold || daysUntilExpiry < 0;
          })
          .map((item) => ({
            $id: item.$id,
            name: item.name,
            expiry_date: item.expiry_date,
            date_type: item.date_type,
            inventory_id: item.inventory_id,
            is_frozen: item.is_frozen,
            quantity: item.quantity,
            barcode: item.barcode,
            is_removed: item.is_removed ?? false, // Default to false if missing
          }));

        setFlaggedItems(filteredItems);
      } catch (err) {
        console.error("Error fetching expiring items:", err);
        setError("Failed to fetch expiring items.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpiringItems();
  }, [daysThreshold]);

  return { flaggedItems, loading, error };
};
