import { FeatureCard, ItemCard } from "@/components/Cards";
import Search from "@/components/Search";
import icons from "@/constants/icons";
import images from "@/constants/images";
import { Link, router } from "expo-router";
import { Text, View, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Inventory from "./inventory";
import Filters from "@/components/Filters";

export default function Index() {
  const handleCardPress = (route: string) => router.push(`/${route}`);

  return (
    <SafeAreaView className="bg-white h-full">
      <View className="px-5">
        <Search />
        <View className="my-5">
          <View className="flex flex-row items-center justify-between">
            <Text className="text-xl font-rubik-bold text-primary-300">
              Flagged Inventory Items
            </Text>
            <TouchableOpacity>
              <Text className="text-base font-rubik-bold text-black-300">
                See All
              </Text>
            </TouchableOpacity>
          </View>
          <Filters />
          <View className="flex flex-row mt-5 gap-5">
            <ItemCard onPress={() => handleCardPress("inventory")} />
            <ItemCard onPress={() => handleCardPress("inventory")} />
            <ItemCard onPress={() => handleCardPress("inventory")} />
          </View>
        </View>

        <View className="flex flex-row items-center justify-between">
          <Text className="text-4xl font-rubik-bold text-primary-300">
            Kitchen Hub
          </Text>
          <TouchableOpacity>
            <Text className="text-base font-rubik-bold text-black-300">
              See All
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex flex-row gap-5 mt-5">
          <FeatureCard
            title="Inventory"
            description="View your full inventory"
            imageSource={images.newYork} // Use appropriate image
            onPress={() => handleCardPress("inventory")}
          />

          <FeatureCard
            title="Shopping List"
            description="Manage your shopping list"
            imageSource={images.newYork} // Use appropriate image
            onPress={() => handleCardPress("shooping-list")}
          />
        </View>

        <View className="flex flex-row gap-5 mt-5">
          <FeatureCard
            title="Kitchen Insights"
            description="View your use and wasteage analytics"
            imageSource={images.newYork} // Use appropriate image
            onPress={() => handleCardPress("kitchen-insights")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
