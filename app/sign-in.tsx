import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import images from "@/constants/images";
import icons from "@/constants/icons";
import { login } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { Redirect } from "expo-router";

const SignIn = () => {
  const  { refetch, loading, isLoggedIn } = useGlobalContext();

  if(!loading && isLoggedIn) {
    console.log('User currently logged in!');
    return <Redirect href='/' />
  }

  const handleLogin = async () => {
    const result = await login();

    if(result) {
      console.log('Login Successful');
      refetch();
    } else {
      Alert.alert('Error', 'Failed to login!')
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView contentContainerClassName="h-full">
        <Image
          source={images.onboarding}
          className="w-full h-3/4"
          resizeMode="contain"
        />
        <View className="px-10">
          <Text className="text-base text-center uppercase font-rubik text-black-200">
            Let's get you closer to {"\n"}
            <Text className="text-primary-300 font-rubik-bold">Your Waste-Free Future</Text>
          </Text>

          <Text className="text-lg font-rubik-text-black-200 text-center mt-12">
            Login to KitchenRadar with Google
          </Text>

          <TouchableOpacity
            onPress={handleLogin}
            className="bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-5"
          >
            <View className="flex flex-row items-center justify-center">
              <Image
                source={icons.google}
                className="w-5 h-5"
                resizeMode="contain"
              />
              <Text className="text-lg font-rubik-medium text-black-300 ml-2">
                Continue using Google
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
