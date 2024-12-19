import { View, Text, Button, StyleSheet } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function Search() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  return (
    <View style={SearchBarStyle.container}>
      <Text
        style={SearchBarStyle.input}
        onPress={() => navigation.navigate('SearchHistory')}
      >请输入关键词</Text>
      <Button title='搜索' />
    </View>
  )
}

const SearchBarStyle = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#2196F3',
        borderWidth: 1,
        borderRadius: 5,
    }, input: {
        flex: 1,
        paddingLeft: 10,
    },
});