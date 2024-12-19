import React, { useState, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icons from 'react-native-vector-icons/AntDesign';
import { useAppSelector } from './src/store/hooks';
import { Provider } from 'react-redux';
import Mall from './src/pages/Mall';
import Home from './src/pages/Home';
import store from './src/store';

const Tab = createBottomTabNavigator();

function Inner() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName='Mall'
        backBehavior='history'
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {height: useAppSelector(state => state.bottomBar).height},
        }}
      >
        <Tab.Screen
          name="Mall"
          component={Mall}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icons name="home" color={color} size={size} />
            )
          }}
        />
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icons name="user" color={color} size={size} />
            )
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <Inner />
    </Provider>
  )
}