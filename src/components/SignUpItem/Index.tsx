import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ToastAndroid,
  Animated,
} from "react-native";
import {SvgXml} from "react-native-svg";
import React, {useEffect, useState, useRef} from "react";
import {useNavigation} from "@react-navigation/native";
import {type NativeStackNavigationProp} from "@react-navigation/native-stack";
import qs from "qs";
import axios from "@/utils/axios";
// import axios from 'axios';
import {responseType} from "@/types";
import alert from "@/utils/alert";

interface captchaType extends responseType {
  data: {
    captchaKey: string;
    captchaData: string;
  };
}

export default function SignUp({handleSignUp}: {handleSignUp?: () => void}) {
  const [username, onChangeUsername] = useState("");
  const [email, onChangeEmail] = useState("");
  const [pwd, onChangePwd] = useState("");
  const [confirmPwd, onChangeConfirmPwd] = useState("");
  const [captcha, onChangeCaptcha] = useState("");
  const [xml, onChangeXml] = useState("");
  const captchaKey = useRef("");
  const animation = useRef(new Animated.Value(0)).current;
  const [nameHighlight, setNameHighlight] = useState(false);
  const [nameWarn, setNameWarn] = useState<string[]>([]);
  const [emailHighlight, setEmailHighlight] = useState(false);
  const [emailWarn, setEmailWarn] = useState<string[]>([]);
  const [pwdHighlight, setPwdHighlight] = useState(false);
  const [pwdWarn, setPwdWarn] = useState<string[]>([]);
  const [confPwdHighlight, setConfPwdHighlight] = useState(false);
  const [captchaHighlight, setCaptchaHighlight] = useState(false);
  const [captchaWarn, setCaptchaWarn] = useState<string[]>([]);
  useEffect(() => {
    axios.get("/captcha").then(
      ({data}: {data: captchaType}) => {
        onChangeXml(data.data.captchaData);
        captchaKey.current = data.data.captchaKey;
      },
      (err: any) => {
        console.log("err", err);
      },
    );
    return () => {};
  }, []);
  function verifyPwdSame() {
    if (pwd !== confirmPwd) {
      setConfPwdHighlight(true);
      let aniArr = [];
      for (let i = 0; i < 3; i++) {
        aniArr.push(
          Animated.timing(animation, {
            toValue: 10, // 最大抖动幅度
            duration: 50,
            useNativeDriver: true, // 如果使用原生驱动，则设置为true
          }),
        );
        aniArr.push(
          Animated.timing(animation, {
            toValue: -10,
            duration: 50,
            useNativeDriver: true,
          }),
        );
      }
      aniArr.push(
        Animated.timing(animation, {
          toValue: 0, // 回到原始位置
          duration: 50,
          useNativeDriver: true,
        }),
      );
      Animated.sequence(aniArr).start();
      return false;
    }
    return true;
  }
  function pressSignUp() {
    if (verifyPwdSame()) {
      const params = qs.stringify({
        name: username,
        password: pwd,
        email,
        captchaKey: captchaKey.current,
        captchaText: captcha,
      });
      axios
        .post("/users/sign_up", params, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
        .then(
          res => {
            ToastAndroid.show("注册成功", ToastAndroid.SHORT);
            if (handleSignUp) {
              handleSignUp();
            }
          },
          err => {
            console.log("err", err);
            let matchErr = false;
            err.response.data.errors.forEach((e: string) => {
              if (e.match(/用户名/)) {
                matchErr = true;
                const newWarn = [...nameWarn, e];
                setNameWarn(newWarn);
                setNameHighlight(true);
              }
              if (e.match(/邮箱/)) {
                matchErr = true;
                const newWarn = [...emailWarn, e];
                setEmailWarn(newWarn);
                setEmailHighlight(true);
              }
              if (e.match(/密码/)) {
                matchErr = true;
                const newWarn = [...pwdWarn, e];
                setPwdWarn(newWarn);
                setPwdHighlight(true);
              }
              if (e.match(/验证码/)) {
                matchErr = true;
                const newWarn = [...captchaWarn, e];
                setCaptchaWarn(newWarn);
                setCaptchaHighlight(true);
              }
            });
            if (matchErr === false) alert();
          },
        );
    }
  }

  function resetState(type: string) {
    return () => {
      switch (type) {
        case "name":
          setNameHighlight(false);
          setNameWarn([]);
          break;
        case "email":
          setEmailHighlight(false);
          setEmailWarn([]);
          break;
        case "pwd":
          setPwdHighlight(false);
          setPwdWarn([]);
          break;
        case "confPwd":
          setConfPwdHighlight(false);
          break;
        case "captcha":
          setCaptchaHighlight(false);
          setCaptchaWarn([]);
          break;
      }
    };
  }

  return (
    <Animated.View
      style={[
        SignUpStyle.container,
        {
          transform: [
            {
              translateX: animation,
            },
          ],
        },
      ]}>
      <View style={SignUpStyle.flexBoxC}>
        <Text style={SignUpStyle.label}>用户名:</Text>
        <View style={{width: 200}}>
          <TextInput
            style={[
              SignUpStyle.input,
              nameHighlight ? {borderColor: "red"} : {},
            ]}
            value={username}
            onChangeText={onChangeUsername}
            placeholder="请输入用户名"
            onFocus={resetState("name")}
          />
          {nameHighlight ? (
            nameWarn.map((w, index) => (
              <Text key={index} style={SignUpStyle.highlight}>
                {w}
              </Text>
            ))
          ) : (
            <></>
          )}
        </View>
      </View>
      <View style={SignUpStyle.flexBoxC}>
        <Text style={SignUpStyle.label}>邮箱:</Text>
        <View style={{width: 200}}>
          <TextInput
            style={[
              SignUpStyle.input,
              emailHighlight ? {borderColor: "red"} : {},
            ]}
            value={email}
            onChangeText={onChangeEmail}
            placeholder="请输入邮箱"
            onFocus={resetState("email")}
          />
          {emailHighlight ? (
            emailWarn.map((w, index) => (
              <Text key={index} style={SignUpStyle.highlight}>
                {w}
              </Text>
            ))
          ) : (
            <></>
          )}
        </View>
      </View>
      <View style={SignUpStyle.flexBoxC}>
        <Text style={SignUpStyle.label}>密码:</Text>
        <View style={{width: 200}}>
          <TextInput
            style={[
              SignUpStyle.input,
              pwdHighlight ? {borderColor: "red"} : {},
            ]}
            value={pwd}
            onChangeText={onChangePwd}
            placeholder="请输入密码"
            onFocus={resetState("pwd")}
          />
          {pwdHighlight ? (
            pwdWarn.map((w, index) => (
              <Text key={index} style={SignUpStyle.highlight}>
                {w}
              </Text>
            ))
          ) : (
            <></>
          )}
        </View>
      </View>
      <View style={SignUpStyle.flexBoxC}>
        <Text style={SignUpStyle.label}>确认密码:</Text>
        <View style={{width: 200}}>
          <TextInput
            style={[
              SignUpStyle.input,
              confPwdHighlight ? {borderColor: "red"} : {},
            ]}
            value={confirmPwd}
            onChangeText={onChangeConfirmPwd}
            onBlur={verifyPwdSame}
            placeholder="请再次确认密码"
            onFocus={resetState("confPwd")}
          />
          {confPwdHighlight ? (
            <Text style={SignUpStyle.highlight}>两次输入密码不一致</Text>
          ) : (
            <></>
          )}
        </View>
      </View>
      <View style={SignUpStyle.flexBoxC}>
        <Text style={SignUpStyle.label}>验证码:</Text>
        <View>
          <View
            style={{
              flexDirection: "row",
              width: 200,
              justifyContent: "space-between",
            }}>
            <TextInput
              style={[
                SignUpStyle.input,
                {width: 110},
                captchaHighlight ? {borderColor: "red"} : {},
              ]}
              value={captcha}
              onChangeText={onChangeCaptcha}
              onFocus={resetState("captcha")}
              placeholder="请输入验证码"
            />
            {xml !== "" ? <SvgXml xml={xml} width="100" height="40" /> : <></>}
          </View>
          {captchaHighlight ? (
            captchaWarn.map((w, index) => (
              <Text key={index} style={SignUpStyle.highlight}>
                {w}
              </Text>
            ))
          ) : (
            <></>
          )}
        </View>
      </View>
      <Pressable style={SignUpStyle.signUpBtn} onPress={pressSignUp}>
        <Text style={SignUpStyle.signUpText}>注册</Text>
      </Pressable>
    </Animated.View>
  );
}

const SignUpStyle = StyleSheet.create({
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
    alignItems: "flex-start",
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
  signUpBtn: {
    width: 320,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: "#2196F3",
  },
  signUpText: {
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
  image: {
    width: 50,
    height: 40,
  },
});
