import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface CardProp {
    id: number,
    imageUrl: string,
    title: string,
    price: string,
    sell: number,
};

export default function Card(props: CardProp) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  return (
    <Pressable style={CardStyle.container} onPress={() => navigation.navigate('Detail')}>
      <Image style={CardStyle.image} source={require('@/static/defaultAvator.jpeg')} />
      <View>
        <Text style={CardStyle.title} numberOfLines={1}>TELLARO液态蝴蝶厚底马丁靴</Text>
        <View style={CardStyle.bottomBar}>
            <Text style={CardStyle.price}>￥258</Text>
            <Text>已售800+</Text>
        </View>
      </View>
    </Pressable>
  )
}

const CardStyle = StyleSheet.create({
    container: {
        width: 185,
        overflow: 'hidden',
        padding: 10,
        borderRadius: 5,
        backgroundColor: 'white',
        gap: 10,
    }, image: {
        width: 165,
        height: 165,
    }, bottomBar: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    }, title: {
        fontSize: 16,
        fontWeight: '600',
    }, price: {
        color: 'orange',
        fontSize: 18,
        fontWeight: '600',
    }
})