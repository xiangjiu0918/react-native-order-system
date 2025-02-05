import {View, Text} from 'react-native';
import React from 'react';
import Popup, {type BasePopupProp} from '../Popup/Index';
import SignUpItem from '../SignUpItem/Index';

export default function index(props: BasePopupProp) {
  return (
    <Popup {...props} showBtn={false}>
      <SignUpItem handleSignUp={props.handleVisible} />
    </Popup>
  );
}
