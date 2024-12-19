import {View, Text} from 'react-native';
import React from 'react';
import Popup, {type BasePopupProp} from '../Popup/Index';
import LoadItem from '../LoadItem/Index';

export default function index(props: BasePopupProp) {
  return (
    <Popup {...props} showBtn={false}>
      <LoadItem handleLoad={props.handleVisible} />
    </Popup>
  );
}
