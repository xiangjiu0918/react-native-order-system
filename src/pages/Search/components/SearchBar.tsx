import { View, TextInput, StyleSheet, Button } from 'react-native';
import React, { useState, memo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EventRegister } from 'react-native-event-listeners';

export default function SearchBar({keyWord, changeKeyWord}: {keyWord: string, changeKeyWord: (text: string) => void}) {
  // const [keyWord, changeKeyword] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const saveHistory = async() => {
    const res = await AsyncStorage.getItem('history');
    let history = res?.split(';') || [];
    if (keyWord !== '') {
      // 设置最多存30条
      if (history.length === 30) {
        history.shift();
      }
      history.push(keyWord);
      AsyncStorage.setItem('history', history.join(';'));
      EventRegister.emitEvent('updateHistory');
      navigation.navigate('SearchResult');
    }
  }
  return (
    <View style={[SearchBarStyle.container]}>
      <TextInput
        value={keyWord}
        onChangeText={changeKeyWord}
        placeholder='请输入关键词'
        style={{flex: 1}}
        returnKeyLabel='搜索'
        onSubmitEditing={() => navigation.navigate('SearchResult')}
      />
      <Button onPress={saveHistory} title='搜索' />
    </View>
  )
}

const SearchBarStyle = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 5,
    width: 300,
    height: 40,
    flexDirection: 'row',
  }
})