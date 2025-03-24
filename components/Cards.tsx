import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import images from "@/constants/images";
import icons from "@/constants/icons";
import { InventoryItem } from "@/lib/types";
import { addDays, isBefore } from "date-fns";
import { isWithinInterval } from "date-fns/isWithinInterval";

export const ItemCard = ({
  item,
  onPress,
}: {
  item: InventoryItem;
  onPress?: () => void;
}) => {
  
  const today = new Date();
  const expiry = new Date(item.expiry_date);
  // Reset the time to midnight for proper date comparison
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);


  const isExpired = isBefore(expiry, today);
  const isNearExpiry = isWithinInterval(expiry, {
    start: today,
    end: addDays(today, 7),
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex flex-col items-start w-60 h-40 relative"
    >
      <Image
        source={images.flagCard}
        className="size-full rounded-2xl"
      />
      <Image
        source={images.cardGradient}
        className="size-full rounded-2xl absolute bottom-0"
      />

      {/* Conditional icons */}
      <View className="flex flex-row items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-5 right-5">
        {item.is_frozen && <Image source={icons.frozen} className="w-5 h-5" />}
        {isExpired && <Image source={icons.expired} className="w-5 h-5" />}
        {!isExpired && isNearExpiry && <Image source={icons.warning} className="w-5 h-5" />}
      </View>

      {/* Item Details */}
      <View className="flex flex-col items-start absolute bottom-5 inset-x-5">
        <Text
          className="text-xl font-rubik-extrabold text-black"
          numberOfLines={2} // truncating long product names
          ellipsizeMode="tail" // adding ellipses at the end to indicate its truncated
        >
          {item.name}
        </Text>
        <Text className="text-base font-rubik text-white">
          Expiry: {new Date(item.expiry_date).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};


// export const InventoryCard = ({ onPress }: { onPress?: () => void }) => {
//   const router = useRouter();

//   return (
//     <TouchableOpacity onPress={onPress} className="flex flex-col items-start w-60 h-80 relative">
//       <Image source={images.japan} className="size-full rounded-2xl" />
//       <Image source={images.cardGradient} className="size-full rounded-2xl absolute bottom-0" />
//       <View className="flex flex-row items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-5 right-5">
//         <Image source={icons.star} className="size-4" />
//       </View>
//       <View className="flex flex-col items-start absolute bottom-5 inset-x-5">
//         <Text className="text-xl font-rubik-extrabold text-white">Item Name</Text>
//         <Text className="text-base font-rubik text-white">Expiry: 01/01/2025</Text>
//         <Text className="text-base font-rubik text-white">Storage: Fridge</Text>
//       </View>
//     </TouchableOpacity>
//   );
// };

export const FeatureCard = ({
  title,
  description,
  imageSource,
  onPress,
}: {
  title: string;
  description: string;
  imageSource: any;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      className="flex-1 w-full mt-4 px-3 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70 relative"
      onPress={onPress}
    >
      <Image source={imageSource} className="w-full h-40 rounded-lg" />
      <View className="flex flex-col mt-2">
        <Text className="text-base font-rubik-bold text-black-300">
          {title}
        </Text>
        <Text className="text-xs font-rubik text-black-100">{description}</Text>
      </View>
    </TouchableOpacity>
  );
};
