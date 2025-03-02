import { FeatureCard, ItemCard } from "@/components/Cards";
import Search from "@/components/Search";
import icons from "@/constants/icons";
import images from "@/constants/images";
import { Link, router } from "expo-router";
import { Text, View, Image, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Inventory from "../inventory";
import Filters from "@/components/Filters";
import React from "react";

// FlatList: used over scrollview components when lists of dynamic items are needed
// More memory efficient

export default function Index() {
  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={null}
        renderItem={null}
        keyExtractor={(item) => item.toString()}
        numColumns={2}
        contentContainerClassName="pb-32"
        columnWrapperClassName="flex gap-5 px-5"
        showsVerticalScrollIndicator={false}
        // It is more efficient to put basically the whole index page in the header
        ListHeaderComponent={
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

              {/* Horizontal List of Items Expiring soon */}
              <FlatList
                data={[1, 2, 3]}
                renderItem={({ item }) => <ItemCard />}
                keyExtractor={(item) => item.toString()}
                horizontal
                bounces={false}
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="flex gap-5 mt-5"
              />
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
                imageSource={images.inventory} // Use appropriate image
                onPress={() => router.push('/inventory')}
              />

              <FeatureCard
                title="Shopping List"
                description="Manage your shopping list"
                imageSource={images.list} // Use appropriate image
                onPress={() => router.push('/shopping-list')}
              />
            </View>

            <View className="flex flex-row gap-5 mt-5">
              <FeatureCard
                title="Kitchen Insights"
                description="View your use and wasteage analytics"
                imageSource={images.insights} // Use appropriate image
                onPress={() => router.push('/kitchen-insights')}
              />
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}
