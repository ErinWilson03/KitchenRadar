import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "@/lib/global-provider";
import { Redirect, Slot } from "expo-router";
import React from "react";

export default function AppLayout() {
    const { loading, isLoggedIn } = useGlobalContext();

    if(loading) {
        return (
            <SafeAreaView>
                <ActivityIndicator className="text-primary-300" size="large"/>
            </SafeAreaView>
        )
    }

    if(!isLoggedIn) return <Redirect href="/sign-in" />

    return <Slot />
}