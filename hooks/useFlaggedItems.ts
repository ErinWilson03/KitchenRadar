import { useEffect, useState } from "react";
import { databases, getCurrentUserId } from "@/lib/appwrite"; // Your Appwrite instance
import { DATABASE_ID, INVENTORY_ITEM_COLLECTION_ID } from "@/lib/appwrite"; // Constants for IDs
import { FlaggedItem } from "@/lib/types";

export const useFlaggedItems = (daysThreshold = 7) => {
  const [flaggedItems, setExpiringItems] = useState<FlaggedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpiringItems = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          INVENTORY_ITEM_COLLECTION_ID
        );

        const today = new Date();
        const filteredItems = response.documents.filter((item) => {
          const expiryDate = new Date(item.expiry_date);
          const daysUntilExpiry = (expiryDate - today) / (1000 * 60 * 60 * 24);
          return daysUntilExpiry <= daysThreshold || daysUntilExpiry < 0;
        });

        setExpiringItems(filteredItems as unknown as FlaggedItem[]); // bit of a quick and dirty cast, not really best practice
      } catch (error) {
        console.error("Error fetching expiring items:", error);
        setError("Failed to fetch expiring items.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpiringItems();
  }, [daysThreshold]);

  return { flaggedItems, loading, error };
};
