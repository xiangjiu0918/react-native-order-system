import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import Icons from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Popup, {type BasePopupProp} from '@/components/Popup/Index';
import AddressPopup from '@/components/AddressPopup/Index';
import LoadPopup from '@/components/LoadPopup/Index';
import PayPopup from '@/components/PayPopup/Index';
import {useAppSelector} from '@/store/hooks';
import {EventRegister} from 'react-native-event-listeners';

interface GoodPopupProp extends BasePopupProp {
  mode: 'preSelect' | 'purchase';
}

interface GoodMap {
  [key: string]: GoodItem;
}

interface GoodItem {
  typeIdx: number;
  sizeIdx: number;
  num: number;
}

let {width: windowWidth, height: windowHeight} = Dimensions.get('window');

export default function GoodPopup(props: GoodPopupProp) {
  const {username} = useAppSelector(state => state.user);
  const address = useAppSelector(state => state.address);
  const [selectAddress, changeSelectAddress] = useState(
    address.default === null
      ? address.list[0]
      : address.list.find(item => item.id === address.default),
  );
  const [selectTypeIdx, changeTypeIdx] = useState(-1);
  const [selectSizeIdx, changeSizeIdx] = useState(-1);
  const [num, changeNum] = useState(1);
  const [addressVisible, changeAddressVisible] = useState(false);
  const [loadVisible, changeLoadVisible] = useState(false);
  const [payVisible, changePayVisible] = useState(false);
  const id = '1';
  const prefill = useRef<GoodMap>({});
  const type = [
    {
      src: '@/static/defaultAvator.jpeg',
      text: '红色上衣【单件】',
      stockout: true,
    },
    {
      src: '@/static/defaultAvator.jpeg',
      text: '红色上衣【单件】',
      stockout: false,
    },
    {
      src: '@/static/defaultAvator.jpeg',
      text: '红色上衣【单件】',
      stockout: false,
    },
  ];
  const size = [
    {
      text: 'S',
      stockout: true,
    },
    {
      text: 'S',
      stockout: false,
    },
    {
      text: 'S',
      stockout: false,
    },
    {
      text: 'S',
      stockout: false,
    },
    {
      text: 'S',
      stockout: false,
    },
    {
      text: 'S',
      stockout: false,
    },
  ];
  const handleAddressVisible = () => {
    changeAddressVisible(!addressVisible);
  };
  const handleLoadVisible = () => {
    changeLoadVisible(!loadVisible);
  };
  const handlePayVisible = () => {
    changePayVisible(!payVisible);
  };
  const getPreFilling = async () => {
    const res = await AsyncStorage.getItem('pre-filling');
    if (res !== null) {
      prefill.current = JSON.parse(res);
      const {num, typeIdx, sizeIdx} = prefill.current[id];
      changeNum(num);
      changeTypeIdx(typeIdx);
      changeSizeIdx(sizeIdx);
    }
  };
  const handleBtnPress = () => {
    if (username === undefined) handleLoadVisible();
    else {
      prefill.current[id] = {
        sizeIdx: selectSizeIdx,
        typeIdx: selectTypeIdx,
        num,
      };
      AsyncStorage.setItem('pre-filling', JSON.stringify(prefill.current));
      EventRegister.emitEvent('updatePreFill');
      if (props.mode === 'purchase') handlePayVisible();
    }
  };
  useEffect(() => {
    getPreFilling();
    let preFillListener = EventRegister.addEventListener('updatePreFill', () =>
      getPreFilling(),
    );
    return () => {
      EventRegister.removeEventListener(preFillListener as string);
    };
  }, []);
  return (
    <>
      <Popup
        {...props}
        btnText={props.mode === 'preSelect' ? '提交预选信息' : '立即下单'}
        btnCallBack={handleBtnPress}
        preventDefault={username === undefined}>
        {username !== undefined ? (
          <Pressable
            style={PopupStyle.addressWrap}
            onPress={handleAddressVisible}>
            <View
              style={[PopupStyle.flexBox, {justifyContent: 'space-between'}]}>
              <View style={[PopupStyle.flexBox, {gap: 10}]}>
                <Icons name="enviromento" size={20} color="black" />
                <Text
                  style={{
                    fontSize: 15,
                    color: 'black',
                    height: 20,
                    lineHeight: 20,
                  }}>
                  {selectAddress
                    ? `${selectAddress.name} ${selectAddress.detail}`
                    : '暂无收货地址'}
                </Text>
              </View>
              <Icons name="right" size={15} />
            </View>
            <Text style={{paddingLeft: 30}}>包邮 7天内发货</Text>
          </Pressable>
        ) : (
          <></>
        )}
        <ScrollView contentContainerStyle={PopupStyle.selectDetailWrap}>
          <View style={PopupStyle.pictureNumWrap}>
            <Image
              style={PopupStyle.picture}
              resizeMode="contain"
              source={require('@/static/defaultAvator.jpeg')}
            />
            <View style={{justifyContent: 'space-between'}}>
              <Text style={PopupStyle.price}>￥258</Text>
              <View style={PopupStyle.flexBox}>
                <Pressable
                  disabled={num === 1}
                  style={[
                    PopupStyle.numBtn,
                    num === 1 ? {opacity: 0.5} : {opacity: 1},
                  ]}
                  onPress={() => changeNum(num - 1)}>
                  <Text>-</Text>
                </Pressable>
                <View
                  style={[
                    PopupStyle.flexBox,
                    {width: 50, justifyContent: 'center'},
                  ]}>
                  <Text>{num}</Text>
                </View>
                <Pressable
                  style={PopupStyle.numBtn}
                  onPress={() => changeNum(num + 1)}>
                  <Text>+</Text>
                </Pressable>
                <Text style={{paddingLeft: 10}}>有货</Text>
              </View>
            </View>
          </View>
          <Text style={PopupStyle.typeSizeTitle}>颜色分类（3）</Text>
          <View style={[PopupStyle.flexBox, {gap: 10, flexWrap: 'wrap'}]}>
            {type.map((item, index) => (
              <Pressable
                key={index}
                disabled={item.stockout}
                style={[
                  PopupStyle.flexBox,
                  selectTypeIdx === index
                    ? PopupStyle.typeWrapSelect
                    : PopupStyle.typeWrap,
                  item.stockout ? {opacity: 0.5} : {opacity: 1},
                ]}
                onPress={() => changeTypeIdx(index)}>
                <Image
                  style={{height: 30, width: 30}}
                  resizeMode="contain"
                  source={require('@/static/defaultAvator.jpeg')}
                />
                <Text
                  style={[
                    {paddingHorizontal: 10},
                    selectTypeIdx === index
                      ? {color: 'white'}
                      : {color: 'black'},
                  ]}>
                  {item.text}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={PopupStyle.typeSizeTitle}>尺码</Text>
          <View style={[PopupStyle.flexBox, {gap: 10, flexWrap: 'wrap'}]}>
            {size.map((item, index) => (
              <Text
                key={index}
                disabled={item.stockout}
                style={[
                  PopupStyle.flexBox,
                  selectSizeIdx === index
                    ? PopupStyle.typeWrapSelect
                    : PopupStyle.typeWrap,
                  selectSizeIdx === index ? {color: 'white'} : {color: 'black'},
                  item.stockout ? {opacity: 0.5} : {opacity: 1},
                  {paddingHorizontal: 15, paddingVertical: 5},
                ]}
                onPress={() => changeSizeIdx(index)}>
                {item.text}
              </Text>
            ))}
          </View>
        </ScrollView>
      </Popup>
      <AddressPopup
        visible={addressVisible}
        handleVisible={handleAddressVisible}
        selectItem={selectAddress}
        changeSelectItem={changeSelectAddress}
      />
      <LoadPopup visible={loadVisible} handleVisible={handleLoadVisible} />
      <PayPopup visible={payVisible} handleVisible={handlePayVisible} />
    </>
  );
}

const PopupStyle = StyleSheet.create({
  wrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  container: {
    width: windowWidth,
    height: 700,
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
    gap: 10,
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
});
