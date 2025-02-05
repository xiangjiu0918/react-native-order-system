import React, {useState, createContext, useEffect} from 'react';
import {Alert} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icons from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAppSelector} from './src/store/hooks';
import {Provider} from 'react-redux';
import {useAppDispatch} from '@/store/hooks';
import {load} from '@/store/slice/userSlice';
import Mall from './src/pages/Mall';
import Home from './src/pages/Home';
import store from './src/store';
import axios from '@/utils/axios';
import alert from '@/utils/alert';

const Tab = createBottomTabNavigator();

function Inner() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    checkToken();
  }, []);
  async function checkToken() {
    let token = await AsyncStorage.getItem('token');
    if (token) {
      global.token = token;
      axios.get('/users').then(
        res => {
          const {name: username, email, avatar} = res.data?.data?.user;
          dispatch(load({username, email, avatar}));
        },
        err => {
          console.log('err', err);
          if (err.response?.data?.message === '认证失败') {
            Alert.alert('提示', '登录已过期，请重新登录', [
              {
                text: '好的',
                style: 'cancel',
              },
            ]);
          } else {
            alert();
          }
          AsyncStorage.removeItem('token');
        },
      );
    }
  }
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Mall"
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            height: useAppSelector(state => state.bottomBar).height,
          },
        }}>
        <Tab.Screen
          name="Mall"
          component={Mall}
          options={{
            tabBarIcon: ({color, size}) => (
              <Icons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            tabBarIcon: ({color, size}) => (
              <Icons name="user" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Inner />
    </Provider>
  );
}
