import {View, Text} from 'react-native';
import React, {useState} from 'react';
import Popup, {type BasePopupProp} from '../Popup/Index';
import LoadItem from '../LoadItem/Index';
import SignUpPopup from '../SignUpPopup/Index';

export default function index(props: BasePopupProp) {
  const [signUpVisible, handleSignUpVisible] = useState(false);
  return (
    <>
      <Popup {...props} showBtn={false}>
        <LoadItem
          handleLoad={props.handleVisible}
          handleSignUp={() => handleSignUpVisible(!signUpVisible)}
        />
      </Popup>
      <SignUpPopup
        visible={signUpVisible}
        handleVisible={() => handleSignUpVisible(!signUpVisible)}
      />
    </>
  );
}
