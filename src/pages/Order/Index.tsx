import { View, Text } from 'react-native';
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Total from './Total';
import Unpay from './Unpay';

const { Navigator, Screen } = createMaterialTopTabNavigator();
export default function Order() {
  return (
    <Navigator initialRouteName='Unpay'>
      <Screen name='Total' component={Total} options={{title: '全部'}}/>
      <Screen name='Unpay' component={Unpay} options={{title: '待支付'}}/>
    </Navigator>
  )
}