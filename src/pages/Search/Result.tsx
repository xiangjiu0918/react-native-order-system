import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {CardProp} from '@/components/CardList/components/Card';
import CardList from '@/components/CardList/Index';

export default function Result() {
  const data: CardProp[] = [
    {
      id: 1,
      imageUrl: '@/static/defaultAvator.jpeg',
      name: 'TELLARO液态蝴蝶厚底马丁靴',
      price: '￥258',
      sale: 800,
    },
    {
      id: 2,
      imageUrl: '@/static/defaultAvator.jpeg',
      name: 'TELLARO液态蝴蝶厚底马丁靴',
      price: '￥258',
      sale: 800,
    },
    {
      id: 3,
      imageUrl: '@/static/defaultAvator.jpeg',
      name: 'TELLARO液态蝴蝶厚底马丁靴',
      price: '￥258',
      sale: 800,
    },
    {
      id: 4,
      imageUrl: '@/static/defaultAvator.jpeg',
      name: 'TELLARO液态蝴蝶厚底马丁靴',
      price: '￥258',
      sale: 800,
    },
    {
      id: 5,
      imageUrl: '@/static/defaultAvator.jpeg',
      name: 'TELLARO液态蝴蝶厚底马丁靴',
      price: '￥258',
      sale: 800,
    },
    {
      id: 6,
      imageUrl: '@/static/defaultAvator.jpeg',
      name: 'TELLARO液态蝴蝶厚底马丁靴',
      price: '￥258',
      sale: 800,
    },
    {
      id: 7,
      imageUrl: '@/static/defaultAvator.jpeg',
      name: 'TELLARO液态蝴蝶厚底马丁靴',
      price: '￥258',
      sale: 800,
    },
    {
      id: 8,
      imageUrl: '@/static/defaultAvator.jpeg',
      name: 'TELLARO液态蝴蝶厚底马丁靴',
      price: '￥258',
      sale: 800,
    },
  ];
  return (
    <View style={ResultStyle.container}>
      <CardList data={data} />
    </View>
  );
}

const ResultStyle = StyleSheet.create({
  container: {
    padding: 15,
    gap: 10,
    // backgroundColor: 'white',
    flex: 1,
  },
});
