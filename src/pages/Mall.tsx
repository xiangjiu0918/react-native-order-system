import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {EventRegister} from 'react-native-event-listeners';
import Recommend from './Recommend/Index';
import SearchHistory from './Search/History';
import SearchResult from './Search/Result';
import SearchBar from './Search/components/SearchBar';
import Detail from './Detail/Index';
import AddAddress from './AddAddress';

const {Navigator, Screen} = createNativeStackNavigator();

export default function Mall() {
  const [keyWord, changeKeyword] = useState('');
  useEffect(() => {
    EventRegister.addEventListener('changeKeyWord', keyWord =>
      changeKeyword(keyWord),
    );
  }, []);
  return (
    <Navigator>
      <Screen
        name="Recommend"
        component={Recommend}
        options={{headerShown: false}}
      />
      <Screen
        name="SearchHistory"
        component={SearchHistory}
        options={{
          headerRight: () => (
            <SearchBar keyWord={keyWord} changeKeyWord={changeKeyword} />
          ),
          headerStyle: {
            backgroundColor: '#dddddd',
          },
        }}
      />
      <Screen
        name="SearchResult"
        component={SearchResult}
        options={{
          headerRight: () => (
            <SearchBar keyWord={keyWord} changeKeyWord={changeKeyword} />
          ),
          headerStyle: {
            backgroundColor: '#dddddd',
          },
        }}
      />
      <Screen name="Detail" component={Detail} />
      <Screen
        name="AddAddress"
        component={AddAddress}
        options={{
          title: '添加收货地址',
        }}
      />
    </Navigator>
  );
}
