import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  OAuthProvider,
  Query,
} from "react-native-appwrite";
import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";

export const config = {
  platform: "com.project.kitchenradar",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
};

export const client = new Client();

client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!);

// Creating instances
export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);

// Database-related IDs
export const DATABASE_ID = "6793a60f00088b69ddca";
export const INVENTORY_COLLECTION_ID = "67a8d227002f34cbf6e3";
export const INVENTORY_ITEM_COLLECTION_ID = "67a2a41a0016d6eaf9ae";
export const INSIGHTS_COLLECTION_ID = "67a8d887001b380da540";
export const SHOPPING_LISTS_COLLECTION_ID = "67a8d7840026a7a37040";
export const LIST_ITEMS_COLLECTION_ID = "67a8d82100246a889594";

// Login funcitonality
export async function login(provider: OAuthProvider) {
  try {
    const redirectUri = Linking.createURL("/");

    const response = await account.createOAuth2Token(provider, redirectUri);

    if (!response) throw new Error("Failed to login");

    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    );

    if (browserResult.type != "success")
      throw new Error("Browser result type unsuccessful");

    const url = new URL(browserResult.url);
    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();

    if (!secret || !userId)
      throw new Error("Incorrect URL params: Failed to login");

    const session = await account.createSession(userId, secret);

    if (!session) throw new Error("Failed to create session");

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Logout funcitonality
export async function logout() {
  try {
    await account.deleteSession("current");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Determine current user
export async function getCurrentUser() {
  try {
    const response = await account.get();
    if (response.$id) {
      const userAvatar = avatar.getInitials(response.name);

      return {
        ...response,
        avatar: userAvatar.toString(),
      };
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getCurrentUserId() {
  try {
    const userID = (await account.get()).$id;
    return userID;
  } catch (error) {
    console.error("Error getting UserID: ", error);
    return false;
  }

}

// Get or Create User's inventory
export async function getOrCreateInventoryForCurrentUser() {
  const userID = await getCurrentUserId(); // Ensure this is resolved before use
  try {
    console.log("Fetching inventory for user:", userID);

    const response = await databases.listDocuments(
      DATABASE_ID,
      INVENTORY_COLLECTION_ID,
      [Query.equal("user_id", userID)]  // Correctly use userID here
    );

    console.log("Inventory fetch response:", response);

    if (response.documents.length > 0) {
      console.log("Existing inventory found:", response.documents[0].$id);
      return response.documents[0].$id;
    }

    console.log("No inventory found. Creating inventory for user:", userID);
    const newInventory = await databases.createDocument(
      DATABASE_ID,
      INVENTORY_COLLECTION_ID,
      ID.unique(), // the way appwrite recognises a new unique string is needed
      { user_id: userID } // Use `user_id` correctly
    );

    console.log("New inventory created:", newInventory.$id);
    return newInventory.$id;
  } catch (error) {
    console.error("Error getting/creating inventory:", error);
    return null;
  }
}
