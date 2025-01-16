import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'

interface Props {
    onPress?: () => void;
}

export const ClickableCard = ({onPress}: Props) => {
  return (
    <TouchableOpacity onPress={onPress} className="flex flex-col items-start w-60 h-80 relative">
        <Image />

    </TouchableOpacity>
    
  )
}

export const BasicCard = () => {
    return(
        <View>
            <Text>
                FeaturedCard
            </Text>
        </View>
    )
}