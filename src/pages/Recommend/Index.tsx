import {View, Text, StyleSheet, FlatList} from 'react-native';
import React, {useState} from 'react';
import type {NavigationProp} from '@react-navigation/native';
import {showBottomBar, hideBottomBar} from '@/store/slice/bottomBarSlice';
import {useAppSelector, useAppDispatch} from '@/store/hooks';
import Search from './components/Search';
import {CardProp} from '@/components/CardList/components/Card';
import CardList from '@/components/CardList/Index';
import axios from '@/utils/axios';
import alert from '@/utils/alert';

export default function Recommend({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) {
  const dispatch = useAppDispatch();
  const [goods, setGoods] = useState<CardProp[]>([]);
  React.useEffect(() => {
    navigation.addListener('focus', () => {
      dispatch(showBottomBar());
    });
    navigation.addListener('blur', () => {
      dispatch(hideBottomBar());
    });
  }, [navigation]);
  React.useEffect(() => {
    initGoodsData();
  }, []);
  async function initGoodsData() {
    try {
      const result = await axios.get('/goods');
      const {goods} = result.data.data;
      setGoods(goods);
    } catch (e) {
      console.log('e', e);
      alert();
    }
  }
  // const data: CardProp[] = [
  //   {
  //     id: 1,
  //     imageUrl: '@/static/defaultAvator.jpeg',
  //     title: 'TELLARO液态蝴蝶厚底马丁靴',
  //     price: '￥258',
  //     sell: 800,
  //   },
  //   {
  //     id: 2,
  //     imageUrl: '@/static/defaultAvator.jpeg',
  //     title: 'TELLARO液态蝴蝶厚底马丁靴',
  //     price: '￥258',
  //     sell: 800,
  //   },
  //   {
  //     id: 3,
  //     imageUrl: '@/static/defaultAvator.jpeg',
  //     title: 'TELLARO液态蝴蝶厚底马丁靴',
  //     price: '￥258',
  //     sell: 800,
  //   },
  //   {
  //     id: 4,
  //     imageUrl: '@/static/defaultAvator.jpeg',
  //     title: 'TELLARO液态蝴蝶厚底马丁靴',
  //     price: '￥258',
  //     sell: 800,
  //   },
  //   {
  //     id: 5,
  //     imageUrl: '@/static/defaultAvator.jpeg',
  //     title: 'TELLARO液态蝴蝶厚底马丁靴',
  //     price: '￥258',
  //     sell: 800,
  //   },
  //   {
  //     id: 6,
  //     imageUrl: '@/static/defaultAvator.jpeg',
  //     title: 'TELLARO液态蝴蝶厚底马丁靴',
  //     price: '￥258',
  //     sell: 800,
  //   },
  //   {
  //     id: 7,
  //     imageUrl: '@/static/defaultAvator.jpeg',
  //     title: 'TELLARO液态蝴蝶厚底马丁靴',
  //     price: '￥258',
  //     sell: 800,
  //   },
  //   {
  //     id: 8,
  //     imageUrl: '@/static/defaultAvator.jpeg',
  //     title: 'TELLARO液态蝴蝶厚底马丁靴',
  //     price: '￥258',
  //     sell: 800,
  //   },
  // ];
  return (
    <View style={RecommendStyle.container}>
      <Search />
      <CardList data={goods} />
    </View>
  );
}

const RecommendStyle = StyleSheet.create({
  container: {
    padding: 10,
    gap: 10,
    flex: 1,
  },
});
