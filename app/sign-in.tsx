import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { OAuthProvider } from "react-native-appwrite";

import images from "@/constants/images";
import icons from "@/constants/icons";
import { login } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { Redirect } from "expo-router";

const SignIn = () => {
  const { refetch, loading, isLoggedIn } = useGlobalContext();

  if (!loading && isLoggedIn) {
    console.log("User currently logged in!");
    return <Redirect href="/" />;
  }

  async function handleLogin(provider: OAuthProvider) {
    const isSuccess = await login(provider);
    if (isSuccess) {
      console.log("Login successful");
      return <Redirect href="/" />;
    } else {
      console.error("Login failed");
    }
  }

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView contentContainerClassName="h-full">
        <ImageBackground
          source={images.onboarding}
          className="w-full h-3/4"
          resizeMode="contain"
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: "5%",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Text className="text-center uppercase font-rubik text-black-200 font-rubik-bold text-lg">
              Manage your {"\n"}
              <Text className="text-primary-300 font-rubik-extrabold text-lg my-2">
                Waste-Free Future {"\n"}
              </Text>
            </Text>
          </View>
        </ImageBackground>

        <View className="px-10">
          <Text className="text-lg font-rubik-text-black-200 text-center mt-1">
            Login to KitchenRadar
          </Text>

          {/* Google Login */}
          <TouchableOpacity
            onPress={() => handleLogin(OAuthProvider.Google)}
            className="bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-1"
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

          {/*
          // Apple login
          <TouchableOpacity
            onPress={() => handleLogin(OAuthProvider.Apple)}
            className="bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-1"
          >
            <View className="flex flex-row items-center justify-center">
              <Image
                source={icons.google}
                className="w-5 h-5"
                resizeMode="contain"
              />
              <Text className="text-lg font-rubik-medium text-black-300 ml-2">
                Continue using Apple
              </Text>
            </View>
          </TouchableOpacity>

          // Facebook login
          <TouchableOpacity
            onPress={() => handleLogin(OAuthProvider.Facebook)}
            className="bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-1"
          >
            <View className="flex flex-row items-center justify-center">
              <Image
                source={icons.google}
                className="w-5 h-5"
                resizeMode="contain"
              />
              <Text className="text-lg font-rubik-medium text-black-300 ml-2">
                Continue using Facebook
              </Text>
            </View>
          </TouchableOpacity>

          // Microsoft login
          <TouchableOpacity
            onPress={() => handleLogin(OAuthProvider.Microsoft)}
            className="bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-1"
          >
            <View className="flex flex-row items-center justify-center">
              <Image
                source={icons.google}
                className="w-5 h-5"
                resizeMode="contain"
              />
              <Text className="text-lg font-rubik-medium text-black-300 ml-2">
                Continue using Microsoft
              </Text>
            </View>
          </TouchableOpacity> 
      */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
