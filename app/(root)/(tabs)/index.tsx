import Search from "@/components/Search";
import icons from "@/constants/icons";
import { Link } from "expo-router";
import { Text, View, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="bg-white h-full">
      <View className="px-5">
        <Search />
        <View className="my-5">
          <View className="flex flex-row items-center justify-between">
            <Text>Featured</Text>
            <TouchableOpacity>See All</TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
