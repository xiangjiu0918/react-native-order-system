import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  Pressable,
  KeyboardAvoidingView,
  Keyboard,
  type KeyboardEvent,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icons from 'react-native-vector-icons/AntDesign';
import {opacity} from 'react-native-reanimated/lib/typescript/Colors';

let {width: windowWidth, height: windowHeight} = Dimensions.get('window');

export interface BasePopupProp {
  visible: boolean;
  handleVisible: () => void;
}

export interface PopupProp extends BasePopupProp {
  title?: string;
  btnText?: string;
  btnCallBack?: () => void;
  closeCallback?: () => void;
  showBtn?: boolean;
  preventDefault?: boolean;
  children: React.JSX.Element[] | React.JSX.Element;
}

interface SizeProp {
  text: string;
  stockout: boolean;
}

interface TypeProp extends SizeProp {
  src: string;
}

export default function Popup({
  visible,
  handleVisible,
  children,
  title,
  btnText,
  btnCallBack,
  closeCallback,
  showBtn,
  preventDefault,
}: PopupProp) {
  const [containerHeight, changeContainerHeight] = useState(700);
  const handleBtnPress = () => {
    if (btnCallBack !== undefined) {
      btnCallBack();
    }
    if (preventDefault !== true) handleVisible();
  };
  const handleClose = () => {
    if (closeCallback !== undefined) closeCallback();
    handleVisible();
  };
  return (
    <>
      <Modal
        visible={visible}
        onRequestClose={handleVisible}
        animationType="slide"
        transparent={true}>
        <Pressable style={PopupStyle.wrap} onPress={handleVisible}>
          <Pressable
            style={[PopupStyle.container]}
            onPress={e => e.stopPropagation()}>
            <View style={PopupStyle.topBar}>
              {title ? <Text style={PopupStyle.title}>{title}</Text> : <></>}
              <Pressable style={PopupStyle.close} onPress={handleClose}>
                <Icons name="close" size={25} />
              </Pressable>
            </View>
            {children}
            {showBtn === false ? (
              <></>
            ) : (
              <View style={PopupStyle.buttonWrap}>
                <Pressable style={PopupStyle.button} onPress={handleBtnPress}>
                  <Text style={{color: 'white', fontWeight: '600'}}>
                    {btnText}
                  </Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
      {visible ? <View style={PopupStyle.modal} /> : <></>}
    </>
  );
}

const PopupStyle = StyleSheet.create({
  wrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    overflow: 'scroll',
    // backgroundColor: 'transparent',
  },
  container: {
    marginTop: 200,
    width: windowWidth,
    backgroundColor: '#eeeeee',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modal: {
    width: windowWidth,
    height: windowHeight,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    position: 'absolute',
  },
  topBar: {
    height: 40,
    flexDirection: 'row',
    width: windowWidth,
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  close: {
    position: 'absolute',
    right: 15,
    paddingTop: 15,
  },
  title: {
    height: 25,
    marginTop: 15,
    fontSize: 15,
    fontWeight: '600',
    color: 'black',
  },
  addressWrap: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 5,
    marginBottom: 10,
  },
  flexBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectDetailWrap: {
    backgroundColor: 'white',
    padding: 15,
    flex: 1,
    justifyContent: 'space-between',
  },
  pictureNumWrap: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  picture: {
    height: 80,
    width: 80,
    borderRadius: 5,
  },
  price: {
    color: '#ff6f43',
    fontSize: 25,
    fontWeight: '500',
    lineHeight: 25,
  },
  numBtn: {
    height: 30,
    width: 30,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  typeWrap: {
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#f1f1f1',
  },
  typeWrapSelect: {
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#ff6f43',
  },
  typeSizeTitle: {
    color: 'black',
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: windowWidth - 30,
    backgroundColor: '#ff6f43',
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonWrap: {
    backgroundColor: 'white',
    padding: 15,
  },
});
