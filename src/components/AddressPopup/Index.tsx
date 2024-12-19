import {View, Text, Pressable, StyleSheet} from 'react-native';
import React, {useState} from 'react';
import Icons from 'react-native-vector-icons/AntDesign';
import {EventRegister} from 'react-native-event-listeners';
import Popup, {type BasePopupProp} from '../Popup/Index';
import AddressItem from '@/components/AddressItem/Index';
import AddAddressPopup from '../AddAddressPopup/Index';
import {AddressStore} from '@/store/slice/addressSlice';

interface AddressPopupProp extends BasePopupProp {
  selectItem: AddressStore | undefined;
  changeSelectItem: any;
}

export default function AddressPopup(props: AddressPopupProp) {
  const [manageMode, switchMode] = useState(false);
  const [addVisible, changeAddVisible] = useState(false);
  const [currentSelect, changeCurrentSelect] = useState(props.selectItem);
  const handleManage = () => {
    if (manageMode === false) {
      switchMode(!manageMode);
      EventRegister.emitEvent('manageAddress');
    } else {
      switchMode(!manageMode);
      EventRegister.emitEvent('existManage');
    }
  };
  const handleAddVisible = () => {
    changeAddVisible(!addVisible);
  };
  return (
    <>
      <Popup
        {...props}
        btnText="确认"
        title="收货地址"
        closeCallback={() => switchMode(false)}
        btnCallBack={() => props.changeSelectItem(currentSelect)}>
        <View style={[PopupStyle.flexBox, PopupStyle.container]}>
          <Text style={{color: 'black', fontWeight: '500'}}>常用地址</Text>
          <View style={PopupStyle.flexBox}>
            <Pressable style={PopupStyle.button} onPress={handleManage}>
              <Icons name="edit" style={PopupStyle.text} />
              <Text style={PopupStyle.text}>
                {manageMode === true ? '完成' : '管理'}
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
        />
      </Popup>
      <AddAddressPopup visible={addVisible} handleVisible={handleAddVisible} />
    </>
  );
}

const PopupStyle = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  flexBox: {
    display: 'flex',
    flexDirection: 'row',
  },
  button: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  text: {
    color: '#ff6f43',
  },
});
