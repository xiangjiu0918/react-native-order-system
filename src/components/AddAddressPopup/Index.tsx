import {View, Text} from 'react-native';
import React, {useState} from 'react';
import Popup, {BasePopupProp} from '../Popup/Index';
import AddAddressItem from '../AddAddressItem/Index';
import {type PopupProp} from '../Popup/Index';
import {EventRegister} from 'react-native-event-listeners';

export default function AddAddressPopup(props: BasePopupProp) {
  const handleBtnClose = () => {
    EventRegister.emitEvent('submit');
  };
  return (
    <Popup {...props} btnText="保存地址" btnCallBack={handleBtnClose}>
      <AddAddressItem showBtn={false} />
    </Popup>
  );
}
