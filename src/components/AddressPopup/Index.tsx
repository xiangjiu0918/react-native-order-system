import {View, Text, Pressable, StyleSheet} from "react-native";
import React, {useState, useEffect} from "react";
import Icons from "react-native-vector-icons/AntDesign";
import {EventRegister} from "react-native-event-listeners";
import Popup, {type BasePopupProp} from "../Popup/Index";
import AddressItem from "@/components/AddressItem/Index";
import AddAddressPopup from "../AddAddressPopup/Index";
import {AddressStore} from "@/store/slice/addressSlice";
import {useAppSelector} from "@/store/hooks";

interface AddressPopupProp extends BasePopupProp {
  selectItem: AddressStore | undefined;
  changeSelectItem: any;
}

export default function AddressPopup(props: AddressPopupProp) {
  const address = useAppSelector(state => state.address);
  const [manageMode, switchMode] = useState(false);
  const [addVisible, changeAddVisible] = useState(false);
  const [currentSelect, changeCurrentSelect] = useState(props.selectItem);
  useEffect(() => {
    changeCurrentSelect(props.selectItem);
  }, [props.selectItem]);
  const handleManage = () => {
    if (manageMode === false) {
      switchMode(!manageMode);
      EventRegister.emitEvent("manageAddress");
    } else {
      switchMode(!manageMode);
      EventRegister.emitEvent("existManage");
    }
  };
  const handleAddVisible = () => {
    changeAddVisible(!addVisible);
  };
  function handleClose() {
    switchMode(false);
    if (
      (props.selectItem === undefined && address.list.length > 0) ||
      address.list.findIndex(item => item.id === props.selectItem?.id) === -1
    ) {
      // 如果原本收货地址为空，且新增地址后没有选择收货地址
      // 或者原本选择的地址被删了
      // 那么就默认选择第一条收货地址
      props.changeSelectItem(address.list[0]);
    } else if (address.list.length === 0) {
      // 如果把地址删到一条不剩了，也需要切换默认地址为暂无收货地址
      props.changeSelectItem(null);
    } else {
      // 没有点击确认按钮，不改变选择的地址
      changeCurrentSelect(props.selectItem);
    }
  }
  return (
    <>
      <Popup
        {...props}
        btnText="确认"
        title="收货地址"
        closeCallback={handleClose}
        btnCallBack={() => props.changeSelectItem(currentSelect)}>
        <View style={[PopupStyle.flexBox, PopupStyle.container]}>
          <Text style={{color: "black", fontWeight: "500"}}>常用地址</Text>
          <View style={PopupStyle.flexBox}>
            <Pressable style={PopupStyle.button} onPress={handleManage}>
              <Icons name="edit" style={PopupStyle.text} />
              <Text style={PopupStyle.text}>
                {manageMode === true ? "完成" : "管理"}
              </Text>
            </Pressable>
            <Pressable
              style={[PopupStyle.button, {marginLeft: 15}]}
              onPress={handleAddVisible}>
              <Icons name="plus" style={PopupStyle.text} />
              <Text style={PopupStyle.text}>新增地址</Text>
            </Pressable>
          </View>
        </View>
        <AddressItem
          selectItem={currentSelect}
          changeSelectItem={changeCurrentSelect}
          showAddAddress={handleAddVisible}
        />
      </Popup>
      <AddAddressPopup visible={addVisible} handleVisible={handleAddVisible} />
    </>
  );
}

const PopupStyle = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "white",
  },
  flexBox: {
    display: "flex",
    flexDirection: "row",
  },
  button: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  text: {
    color: "#ff6f43",
  },
});
