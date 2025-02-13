import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ToastAndroid,
} from "react-native";
import React, {useState} from "react";
import {useNavigation} from "@react-navigation/native";
import {type NativeStackNavigationProp} from "@react-navigation/native-stack";
import qs from "qs";
import axios from "@/utils/axios";
import {useAppDispatch} from "@/store/hooks";
import {load} from "@/store/slice/userSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {EventRegister} from "react-native-event-listeners";
interface LoadProp {
  handleLoad?: () => void;
  handleSignUp?: () => void;
}

export default function Load({handleLoad, handleSignUp}: LoadProp) {
  // const {username, password} = useAppSelector(state => state.user);
  const [login, onChangeLogin] = useState("");
  const [pwd, onChangePwd] = useState("");
  const [loginWarn, setLoginWarn] = useState("");
  const [pwdWarn, setPwdWarn] = useState("");
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  function pressLoad() {
    const params = qs.stringify({
      login,
      password: pwd,
    });
    axios
      .post("/users/sign_in", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then(
        res => {
          // console.log('res', res);
          global.token = res.data?.data?.token;
          const {
            id: userId,
            name: username,
            email,
            avatar,
          } = res.data?.data?.user;
          dispatch(load({userId, username, email, avatar}));
          AsyncStorage.setItem("token", res.data?.data?.token);
          EventRegister.emit("load");
          ToastAndroid.show("登陆成功", ToastAndroid.SHORT);
          if (handleLoad) {
            handleLoad();
          }
        },
        err => {
          console.log("err", err);
          err.response.data.errors.forEach((e: string) => {
            if (e.match(/用户/) || e.match(/邮箱/)) {
              setLoginWarn(e);
            }
            if (e.match(/密码/)) {
              setPwdWarn(e);
            }
          });
        },
      );
  }
  function pressSignUp() {
    handleSignUp && handleSignUp();
  }
  return (
    <View style={LoadStyle.container}>
      <View style={LoadStyle.flexBoxC}>
        <Text style={LoadStyle.label}>用户名/邮箱:</Text>
        <View style={{width: 200}}>
          <TextInput
            style={[
              LoadStyle.input,
              loginWarn !== "" ? {borderColor: "red"} : {},
            ]}
            value={login}
            onChangeText={onChangeLogin}
            placeholder="请输入用户名或邮箱"
            onFocus={() => setLoginWarn("")}
          />
          {loginWarn !== "" ? (
            <Text style={LoadStyle.highlight}>{loginWarn}</Text>
          ) : (
            <></>
          )}
        </View>
      </View>
      <View style={LoadStyle.flexBoxC}>
        <Text style={LoadStyle.label}>密码:</Text>
        <View style={{width: 200}}>
          <TextInput
            style={[
              LoadStyle.input,
              pwdWarn !== "" ? {borderColor: "red"} : {},
            ]}
            value={pwd}
            onChangeText={onChangePwd}
            placeholder="请输入密码"
            onFocus={() => setPwdWarn("")}
          />
          {pwdWarn !== "" ? (
            <Text style={LoadStyle.highlight}>{pwdWarn}</Text>
          ) : (
            <></>
          )}
        </View>
      </View>
      <Pressable style={LoadStyle.loadBtn} onPress={pressLoad}>
        <Text style={LoadStyle.loadText}>登录</Text>
      </Pressable>
      <View style={LoadStyle.remark}>
        <Text>* 还没有账号？</Text>
        <Pressable onPress={pressSignUp}>
          <Text style={LoadStyle.signUp}>去注册 {`>`}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const LoadStyle = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    backgroundColor: "white",
    flex: 1,
  },
  flexBoxC: {
    width: 320,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    width: 200,
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  highlight: {
    color: "red",
  },
  loadBtn: {
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: "#2196F3",
  },
  loadText: {
    color: "#fff",
    fontWeight: "500",
  },
  label: {
    fontWeight: "600",
    fontSize: 18,
    lineHeight: 40,
    height: 40,
  },
  remark: {
    flexDirection: "row",
    alignItems: "center",
  },
  signUp: {
    color: "#2196F3",
    textDecorationLine: "underline",
  },
});
