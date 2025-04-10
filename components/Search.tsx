import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import icons from "@/constants/icons";
import { useDebouncedCallback } from "use-debounce";


const Search = () => {
  const path = usePathname();
  const params = useLocalSearchParams<{ query?: string }>(); // we get an object containing query of type string from this method
  const [ search, setSearch ] = useState(params.query);

  const debouncedSearch = useDebouncedCallback((text: string) => 
    router.setParams({text}), 300
  ); // only send a search request every 300ms rather than after every keystroke

  const handleSearch = (text: string) => {
    setSearch(text);
    debouncedSearch(text);
  };

  return (
    <View className="flex flex-row items-center justify-items-between w-full px-4 rounded-lg bg-accent-100 border border-primary-100 mt-1 py-2">
      <View className="flex-1 flex flex-row items-center justify-start z-50">
        <Image source={icons.search} className="size-5" />
        <TextInput
          value={search}
          onChangeText={handleSearch}
          placeholder="Search for something ..."
          className="text-sm font-rubik text-black-300 ml-2 flex-1"
        />
      </View>
      <TouchableOpacity>
        <Image source={icons.filter} className="size-5" />
      </TouchableOpacity>
    </View>
  );
};

export default Search;
