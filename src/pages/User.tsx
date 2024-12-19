import { View, Text, Image, StyleSheet, Pressable, LayoutChangeEvent, Alert } from 'react-native';
import React, { useState } from 'react';
import { NavigationProp } from '@react-navigation/native';
import Icons from 'react-native-vector-icons/AntDesign';
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { exist } from '@/store/slice/userSlice';
import { showBottomBar, hideBottomBar } from '@/store/slice/bottomBarSlice';

export default function Users ({ navigation }: {navigation: NavigationProp<any>}) {
  const { username } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const [width, handleWidth] = useState(0);
  React.useEffect(() => {
    navigation.addListener('focus', () => {
      dispatch(showBottomBar());
    })
    navigation.addListener('blur', () => {
      dispatch(hideBottomBar())
    })
  }, [navigation])
  function handleLayOut(event: LayoutChangeEvent) {
    const { width } = event.nativeEvent.layout;
    handleWidth(width - 70);
  };
  function handleLoad() {
    if (username === undefined) {
      navigation.navigate('Load');
    }
  };
  function handleExist() {
    Alert.alert('提示','确认退出登录?',[{
      text: '确定',
      onPress: () => dispatch(exist()),
    }, {
      text: '取消',
      style: 'cancel',
    }])
  };
  function handleAddress() {
    if (username !== undefined) {
      navigation.navigate('Address');
    } else {
      navigation.navigate('Load');
    }
  };
  function handleOrder() {
    if (username !== undefined) {
      navigation.navigate('Order');
    } else {
      navigation.navigate('Load');
    }
  };
  return (
    <View style={UserStyle.container}>
      <View style={UserStyle.flexBox} onLayout={handleLayOut}>
        <Image style={UserStyle.image} source={require('@/static/defaultAvator.jpeg')} />
        <View style={[UserStyle.infoContainer, {width}]}>
          <Text 
            style={UserStyle.load}
            onPress={handleLoad}
          >
            { username ?? '点击登录'}
          </Text>
          {
            username === undefined ? <></> : (
            <Pressable style={UserStyle.exitBtn}>
              <Text style={{color: '#2196F3'}} onPress={handleExist}>退出登录</Text>
            </Pressable>)
          }
        </View>
      </View>
      <Pressable style={UserStyle.item} onPress={handleAddress}>
        <Text>收件人管理</Text>
        <Icons name="right" />
      </Pressable>
      <Pressable style={UserStyle.item} onPress={handleOrder}>
        <Text>订单管理</Text>
        <Icons name="right" />
      </Pressable>
    </View>
  )
}

const UserStyle = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 50,
    gap: 10,
  }, item: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    fontSize: 15,
    fontWeight: '500',
  }, image: {
    height: 70,
    width: 70,
    borderRadius: 70,
  }, flexBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
  }, infoContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },load: {
    fontSize: 20,
    fontWeight: '600',
  }, exitBtn: {
    borderColor: '#2196F3',
    borderWidth: 1,
    borderRadius: 15,
    padding: 5,
  }
})