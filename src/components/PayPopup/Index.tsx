import {View, Text, StyleSheet, Pressable, ToastAndroid} from 'react-native';
import React, {useState} from 'react';
import Icons from 'react-native-vector-icons/AntDesign';
import Spinner from 'react-native-loading-spinner-overlay';
import Popup from '@/components/Popup/Index';
import {type BasePopupProp} from '@/components/Popup/Index';

export default function Index(props: BasePopupProp) {
  const [select, changeSelect] = useState(0);
  const [spinnerVisible, changSipnnerVisible] = useState(false);
  const handlePurchase = () => {
    changSipnnerVisible(true);
    setTimeout(() => {
      changSipnnerVisible(false);
      ToastAndroid.show('下单成功', ToastAndroid.LONG);
    }, 3000);
  };
  return (
    <>
      <Popup {...props} btnText="确认付款" btnCallBack={handlePurchase}>
        <View style={PayStyle.container}>
          <Text style={PayStyle.amount}>￥256</Text>
          <View style={PayStyle.accountBar}>
            <Text>账号</Text>
            <Text style={{color: 'black'}}>135******24</Text>
          </View>
          <View style={PayStyle.way}>
            <Pressable
              style={[PayStyle.line, PayStyle.division]}
              onPress={() => changeSelect(0)}>
              <Text style={{color: 'black'}}>招商银行储蓄卡</Text>
              {select === 0 ? (
                <Icons name="check" color="#ff6f43" size={15} />
              ) : (
                <></>
              )}
            </Pressable>
            <Pressable
              style={[PayStyle.line, PayStyle.division]}
              onPress={() => changeSelect(1)}>
              <Text style={{color: 'black'}}>农业银行储蓄卡</Text>
              {select === 1 ? (
                <Icons name="check" color="#ff6f43" size={15} />
              ) : (
                <></>
              )}
            </Pressable>
            <Pressable style={PayStyle.line} onPress={() => changeSelect(2)}>
              <Text style={{color: 'black'}}>花呗</Text>
              {select === 2 ? (
                <Icons name="check" color="#ff6f43" size={15} />
              ) : (
                <></>
              )}
            </Pressable>
          </View>
        </View>
      </Popup>
      <Spinner visible={spinnerVisible} textContent="下单中" />
    </>
  );
}

const PayStyle = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 15,
  },
  amount: {
    fontSize: 35,
    color: 'black',
    fontWeight: '500',
    textAlign: 'center',
  },
  accountBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  way: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 30,
  },
  line: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  division: {
    borderBottomWidth: 1,
    borderColor: '#e1e1e1',
  },
});
