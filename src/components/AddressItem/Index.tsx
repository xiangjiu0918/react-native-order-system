import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
  Pressable,
} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import React, {useEffect, useState} from "react";
import {useHeaderHeight} from "@react-navigation/elements";
import Icons from "react-native-vector-icons/AntDesign";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {EventRegister} from "react-native-event-listeners";
import axios from "@/utils/axios";
import {useAppSelector, useAppDispatch} from "@/store/hooks";
import {initList} from "@/store/slice/addressSlice";
import {
  AddressStore,
  changeItem,
  deleteItem,
  changeDefault,
  selectAddress,
} from "@/store/slice/addressSlice";
import CheckBox from "@react-native-community/checkbox";
import alert from "@/utils/alert";

export default function AddressItem({
  selectItem,
  changeSelectItem,
}: {
  selectItem?: AddressStore | undefined;
  changeSelectItem?: any;
}) {
  const address = useAppSelector(state => state.address);
  const dispatch = useAppDispatch();
  const height =
    useWindowDimensions().height -
    useHeaderHeight() -
    (StatusBar.currentHeight || 0);
  const [manageMode, switchMode] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  EventRegister.addEventListener("manageAddress", () => switchMode(true));
  EventRegister.addEventListener("existManage", () => switchMode(false));
  useEffect(() => {
    initAddress();
  }, []);
  function initAddress() {
    axios.get("/addresses").then(
      res => {
        const {addresses: list, defaultId} = res.data?.data;
        if (list.length > 0) {
          dispatch(
            initList({
              list,
              default: defaultId,
            }),
          );
        }
      },
      err => {
        alert();
      },
    );
  }
  function handleEdit(address: AddressStore) {
    return () => {
      navigation.navigate("AddAddress", address);
    };
  }
  function handleDefault(id: number) {
    return (isDefault: boolean) => {
      dispatch(changeDefault({isDefault, id}));
    };
  }
  function handleCopy(payload: AddressStore) {
    return () => {
      Clipboard.setString(`收件人：${payload.name}
        手机号码：${payload.tel}
        所在地区：${payload.district}
        详细地址：${payload.detail}
      `);
    };
  }
  return (
    <ScrollView style={AddressStyle.container}>
      {address.list.length > 0 ? (
        <></>
      ) : (
        <View style={[AddressStyle.empty]}>
          <Text>暂无收货人信息</Text>
        </View>
      )}
      {address.list.map(item => (
        <Pressable
          key={item.id}
          style={[
            AddressStyle.item,
            item.id === selectItem?.id ? {backgroundColor: "#fff1eb"} : {},
          ]}
          onPress={() => changeSelectItem && changeSelectItem(item)}>
          <View style={AddressStyle.abstract}>
            <View style={{gap: 5}}>
              <Text
                style={[
                  AddressStyle.distinct,
                  item.id === selectItem?.id ? {color: "#ff6600"} : {},
                ]}>
                {item.district.join(" ")}
              </Text>
              <Text
                style={[
                  AddressStyle.mainText,
                  item.id === selectItem?.id ? {color: "#ff6600"} : {},
                ]}>
                {item.detail}
              </Text>
              <View style={AddressStyle.line}>
                <Text
                  style={[
                    AddressStyle.nameTel,
                    item.id === selectItem?.id ? {color: "#ff6600"} : {},
                  ]}>
                  {item.name}
                </Text>
                <Text
                  style={[
                    AddressStyle.nameTel,
                    item.id === selectItem?.id ? {color: "#ff6600"} : {},
                  ]}>
                  {item.tel}
                </Text>
                {item.id === address.default ? (
                  <Text style={AddressStyle.default}>默认</Text>
                ) : (
                  <></>
                )}
              </View>
            </View>
            <Icons name="edit" size={20} onPress={handleEdit(item)} />
          </View>
          {manageMode === true ? (
            <View style={AddressStyle.manageBar}>
              <View style={AddressStyle.line}>
                <CheckBox
                  value={address.default === item.id}
                  onValueChange={handleDefault(item.id)}
                />
                <Text>默认</Text>
              </View>
              <View style={AddressStyle.line}>
                <Pressable
                  style={AddressStyle.button}
                  onPress={() => dispatch(deleteItem(item.id))}>
                  <Text style={AddressStyle.btnText}>删除</Text>
                </Pressable>
                <Pressable
                  style={AddressStyle.button}
                  onPress={handleCopy(item)}>
                  <Text style={AddressStyle.btnText}>复制</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <></>
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const AddressStyle = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  empty: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 200,
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "#eeeeee",
  },
  abstract: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  line: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  distinct: {
    fontSize: 12,
  },
  mainText: {
    color: "black",
    fontWeight: "500",
  },
  nameTel: {
    color: "#3c3c3c",
    fontSize: 13,
  },
  default: {
    backgroundColor: "#feddc7",
    color: "#ff6600",
    fontSize: 10,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 5,
  },
  manageBar: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  },
  button: {
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 5,
    borderRadius: 5,
  },
  btnText: {
    color: "black",
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
});
