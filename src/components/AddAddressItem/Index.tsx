import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ToastAndroid,
} from "react-native";
import React, {useEffect, useState, useRef} from "react";
import CheckBox from "@react-native-community/checkbox";
import {NavigationProp} from "@react-navigation/native";
import axios from "@/utils/axios";
import {Picker, Provider} from "@ant-design/react-native";
import {Md5} from "ts-md5";
import {
  addItem,
  changeItem,
  type Address,
  type AddressStore,
} from "@/store/slice/addressSlice";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {EventRegister} from "react-native-event-listeners";
import alert from "@/utils/alert";

interface districtOption {
  value: string;
  label: string;
  children?: districtOption[];
}

export default function AddAddress(props: {
  navigation?: NavigationProp<any>;
  showBtn: boolean;
  handleClose?: () => void;
}) {
  const {navigation} = props;
  let idRef = useRef(-1);
  const [isDefault, switchDefault] = useState(false);
  const [name, changeName] = useState("");
  const [tel, changeTel] = useState("");
  const [district, changeDistrict] = useState([]);
  const [detail, changeDetail] = useState("");
  const [telWarn, setTelWarn] = useState<string[]>([]);
  const [telHighlight, setTelHighlight] = useState(false);
  const address = useAppSelector(state => state.address);
  const dispatch = useAppDispatch();
  const [districtList, setList] = useState([] as districtOption[]);
  const btnCallBack = useRef(() => {});
  function transDistrict(arr: any): districtOption[] {
    return arr.map((item: any) => {
      let res: districtOption = {
        value: item.fullname,
        label: item.fullname,
      };
      if (item.districts !== undefined) {
        res.children = transDistrict(item.districts);
      }
      return res;
    });
  }
  function submit() {
    const payloadBase: Address = {
      name,
      tel,
      district,
      detail,
      default: isDefault,
    };
    if (idRef.current === -1) {
      axios.post("/addresses", payloadBase).then(
        res => {
          dispatch(addItem(payloadBase));
          ToastAndroid.show("添加成功", ToastAndroid.SHORT);
          if (props.handleClose) props.handleClose();
          else navigation?.goBack();
        },
        err => {
          console.log("err", err);
          let matchErr = false;
          err.response.data.errors.forEach((e: string) => {
            if (e.match(/手机号/)) {
              matchErr = true;
              const newWarn = [...telWarn, e];
              setTelWarn(newWarn);
              setTelHighlight(true);
            }
          });
          if (matchErr === false) alert();
        },
      );
    } else {
      axios
        .put(`/addresses/${idRef.current}`, payloadBase, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
        .then(
          res => {
            const payloadWithId: AddressStore = {
              ...payloadBase,
              id: idRef.current,
            };
            dispatch(changeItem(payloadWithId));
            ToastAndroid.show("修改成功", ToastAndroid.SHORT);
            if (props.handleClose) props.handleClose();
            else navigation?.goBack();
          },
          err => {
            console.log("err", err);
            let matchErr = false;
            err.response.data.errors.forEach((e: string) => {
              if (e.match(/手机号/)) {
                matchErr = true;
                const newWarn = [...telWarn, e];
                setTelWarn(newWarn);
                setTelHighlight(true);
              }
            });
            if (matchErr === false) alert();
          },
        );
    }
  }
  btnCallBack.current = submit;
  function resetState(type: string) {
    return () => {
      switch (type) {
        case "tel":
          setTelHighlight(false);
          setTelWarn([]);
          break;
      }
    };
  }
  useEffect(() => {
    const submitListener = EventRegister.addEventListener("submit", () =>
      btnCallBack.current(),
    );
    const addressListener = EventRegister.addEventListener(
      "addAddress",
      address => {
        idRef.current = address.id;
        switchDefault(address.default);
        changeName(address.name);
        changeTel(address.tel);
        changeDistrict(address.district);
        changeDetail(address.detail);
      },
    );
    axios.get("/addresses/district/list").then(
      res => {
        setList(transDistrict(res.data?.data?.list));
      },
      err => alert(),
    );
    return () => {
      EventRegister.removeEventListener(submitListener as string);
      EventRegister.removeEventListener(addressListener as string);
    };
  }, []);
  return (
    <Provider>
      <View style={AddAddressStyle.container}>
        <View style={AddAddressStyle.line}>
          <Text>地址信息</Text>
          <View style={AddAddressStyle.line}>
            <CheckBox value={isDefault} onValueChange={switchDefault} />
            <Text>默认收货地址</Text>
          </View>
        </View>
        <View style={AddAddressStyle.line}>
          <View style={AddAddressStyle.label}>
            <Text>收件人</Text>
            <Text style={{color: "red"}}>*</Text>
          </View>
          <TextInput
            style={AddAddressStyle.input}
            value={name}
            onChangeText={changeName}
            placeholder="收件人名字"
          />
        </View>
        <View style={AddAddressStyle.line}>
          <View style={AddAddressStyle.label}>
            <Text>手机号</Text>
            <Text style={{color: "red"}}>*</Text>
          </View>
          {/* <TextInput
            style={AddAddressStyle.input}
            value={tel}
            onChangeText={changeTel}
            placeholder="手机号"
          /> */}
          <View style={{width: 280}}>
            <TextInput
              style={[
                AddAddressStyle.input,
                telHighlight ? {borderColor: "red"} : {},
              ]}
              value={tel}
              onChangeText={changeTel}
              placeholder="请输入手机号"
              onFocus={resetState("pwd")}
            />
            {telHighlight ? (
              telWarn.map((w, index) => (
                <Text key={index} style={AddAddressStyle.highlight}>
                  {w}
                </Text>
              ))
            ) : (
              <></>
            )}
          </View>
        </View>
        <View style={AddAddressStyle.line}>
          <View style={AddAddressStyle.label}>
            <Text>所在地区</Text>
            <Text style={{color: "red"}}>*</Text>
          </View>
          <Picker
            data={districtList}
            cols={3}
            value={district}
            onChange={changeDistrict}>
            <Text style={AddAddressStyle.input}>
              {district.length > 0 ? district.join(" ") : "省、市、区、街道"}
            </Text>
          </Picker>
        </View>
        <View style={AddAddressStyle.line}>
          <View style={AddAddressStyle.label}>
            <Text>详细地址</Text>
            <Text style={{color: "red"}}>*</Text>
          </View>
          <TextInput
            style={AddAddressStyle.input}
            value={detail}
            onChangeText={changeDetail}
            placeholder="小区、写字楼、门牌号等"
          />
        </View>
        {props.showBtn ? (
          <Pressable style={AddAddressStyle.loadBtn} onPress={submit}>
            <Text style={AddAddressStyle.loadText}>确认</Text>
          </Pressable>
        ) : (
          <></>
        )}
      </View>
    </Provider>
  );
}

const AddAddressStyle = StyleSheet.create({
  container: {
    display: "flex",
    padding: 20,
    backgroundColor: "#f8f8f8",
    gap: 10,
    flex: 1,
  },
  line: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    display: "flex",
    flexDirection: "row",
  },
  input: {
    width: 280,
    height: 40,
    backgroundColor: "#efefef",
    borderRadius: 5,
    padding: 10,
  },
  loadBtn: {
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: "#2196F3",
    display: "flex",
    alignItems: "center",
    marginTop: 10,
  },
  loadText: {
    color: "#fff",
    fontWeight: "500",
  },
  highlight: {
    color: "red",
  },
});
