import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icons from 'react-native-vector-icons/AntDesign'
import { useFocusEffect } from '@react-navigation/native';
import {EventRegister} from 'react-native-event-listeners';
import { showBottomBar, hideBottomBar } from '../store/slice/bottomBarSlice';
import { useAppSelector, useAppDispatch } from '../store/hooks'
import User from './User';
import Order from './Order/Index';
import Address from './Address';
import AddAddress from './AddAddress';
import Load from './Load';
import { exist } from '../store/slice/userSlice';

const { Navigator, Screen } = createNativeStackNavigator();

export default function Home({navigation} : {navigation: NavigationProp<any>}) {
  const dispatch = useAppDispatch();
  const [manageMode, switchMode] = useState(false);
  useFocusEffect(
    React.useCallback(() => {
      dispatch(showBottomBar());
      return () => {
        dispatch(hideBottomBar());}
    }, [])
  );
  function handleManage() {
    switchMode(true);
    EventRegister.emitEvent('manageAddress');
  }
  function existManage() {
    switchMode(false);
    EventRegister.emitEvent('existManage');
  }
  return (
    <Navigator initialRouteName='User'>
      <Screen name="User" component={User} options={{ headerShown: false }}/>
      <Screen name="Address" component={Address} options={{
        title: '收货地址',
        headerRight: () =>(
          <>
            {
              manageMode === true ? (
                <Pressable style={HomeStyle.button} onPress={existManage}>
                  <Icons name='logout' style={HomeStyle.text}/>
                  <Text style={HomeStyle.text}>退出管理</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    style={HomeStyle.button}
                    onPress={handleManage}
                  >
                    <Icons name="edit" style={HomeStyle.text} />
                    <Text style={HomeStyle.text}>管理</Text>
                  </Pressable>
                  <Pressable
                    style={[HomeStyle.button, {marginLeft: 15}]}
                    onPress={() => navigation.navigate('AddAddress')}
                  >
                    <Icons name="plus" style={HomeStyle.text} />
                    <Text style={HomeStyle.text}>新增地址</Text>
                  </Pressable>
                </>
              )
            }
          </>
        )
      }}/>
      <Screen name="AddAddress" component={AddAddress} options={{
        title: '添加收货地址',
      }}/>
      <Screen name="Order" component={Order} options={{
        title: '订单详情',
      }}/>
      <Screen name='Load' component={Load} />
    </Navigator>
  )
}

const HomeStyle = StyleSheet.create({
  button: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  }, text: {
    color: '#2196F3',
  }
});