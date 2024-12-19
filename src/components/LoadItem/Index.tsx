import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ToastAndroid,
} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {type NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAppSelector, useAppDispatch} from '@/store/hooks';
import {load, UserState} from '@/store/slice/userSlice';

export default function Load({handleLoad}: {handleLoad?: () => void}) {
  const {username, password} = useAppSelector(state => state.user);
  const [tmpUsername, onChangeUsername] = useState(username);
  const [tmpPwd, onChangePwd] = useState(password);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  function hanleLoad() {
    const payload: UserState = {
      username: tmpUsername,
      password: tmpPwd,
    };
    dispatch(load(payload));
    ToastAndroid.show('登陆成功', ToastAndroid.SHORT);
    if (handleLoad) {
      handleLoad();
    }
  }
  return (
    <View style={LoadStyle.container}>
      <View style={LoadStyle.flexBoxC}>
        <Text style={LoadStyle.label}>用户名:</Text>
        <TextInput
          style={LoadStyle.input}
          value={tmpUsername}
          onChangeText={onChangeUsername}
          placeholder="请输入用户名"
        />
      </View>
      <View style={LoadStyle.flexBoxC}>
        <Text style={LoadStyle.label}>密码:</Text>
        <TextInput
          style={LoadStyle.input}
          value={tmpPwd}
          onChangeText={onChangePwd}
          placeholder="请输入密码"
        />
      </View>
      <Pressable style={LoadStyle.loadBtn} onPress={hanleLoad}>
        <Text style={LoadStyle.loadText}>登录</Text>
      </Pressable>
      <Text>* 首次登录会自动注册账号</Text>
    </View>
  );
}

const LoadStyle = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    backgroundColor: 'white',
    flex: 1,
  },
  flexBoxC: {
    width: 280,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    width: 200,
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  loadBtn: {
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: '#2196F3',
  },
  loadText: {
    color: '#fff',
    fontWeight: '500',
  },
  label: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 40,
    height: 40,
  },
});
