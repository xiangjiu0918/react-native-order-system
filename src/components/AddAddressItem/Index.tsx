import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ToastAndroid,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import CheckBox from '@react-native-community/checkbox';
import {NavigationProp} from '@react-navigation/native';
import axios from 'axios';
import {Picker, Provider} from '@ant-design/react-native';
import {Md5} from 'ts-md5';
import {
  addItem,
  changeItem,
  type Address,
  type AddressStore,
} from '@/store/slice/addressSlice';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {EventRegister} from 'react-native-event-listeners';

interface districtOption {
  value: string;
  label: string;
  children?: districtOption[];
}

export default function AddAddress(props: {
  navigation?: NavigationProp<any>;
  route?: {params: AddressStore};
  showBtn: boolean;
}) {
  const {navigation} = props;
  const payload = props.route?.params;
  const [isDefault, switchDefault] = useState(false);
  const [name, changeName] = useState(payload?.name || '');
  const [tel, changeTel] = useState(payload?.tel || '');
  const [district, changeDistrict] = useState(payload?.district || []);
  const [detail, changeDetail] = useState(payload?.detail || '');
  const address = useAppSelector(state => state.address);
  const dispatch = useAppDispatch();
  const [districtList, setList] = useState([] as districtOption[]);
  const btnCallBack = useRef(() => {});
  function transDistrict(arr: any): districtOption[] {
    return arr.map((item: any) => {
      let res: districtOption = {
        value: item.fullname,
        label: item.fullname,
      };
      if (item.districts !== undefined) {
        res.children = transDistrict(item.districts);
      }
      return res;
    });
  }
  function submit() {
    const payloadBase: Address = {
      name,
      tel,
      district,
      detail,
      default: isDefault,
    };
    if (payload === undefined) {
      dispatch(addItem(payloadBase));
      ToastAndroid.show('添加成功', ToastAndroid.SHORT);
    } else {
      const payloadWithId: AddressStore = {
        ...payloadBase,
        id: payload.id,
      };
      dispatch(changeItem(payloadWithId));
      ToastAndroid.show('修改成功', ToastAndroid.SHORT);
    }
    if (props.showBtn === true) {
      // 说明是全屏模式
      navigation?.goBack();
    }
  }
  btnCallBack.current = submit;
  useEffect(() => {
    let submitListener = EventRegister.addEventListener('submit', () =>
      btnCallBack.current(),
    );
    const sig = Md5.hashStr(
      '/ws/district/v1/list?key=U3MBZ-EXWCT-2L2X2-VDRMF-WRVH2-QXF3M&struct_type=1nigx3vilUvqIpiA99xdSDpKyQurO8OEH',
    ).toLowerCase();
    axios
      .get('https://apis.map.qq.com/ws/district/v1/list', {
        params: {
          key: 'U3MBZ-EXWCT-2L2X2-VDRMF-WRVH2-QXF3M',
          struct_type: 1,
          sig,
        },
      })
      .then(res => {
        if (res.status === 200) {
          setList(transDistrict(res.data.result));
        }
      });
    return () => {
      EventRegister.removeEventListener(submitListener as string);
    };
  }, []);
  return (
    <Provider>
      <View style={AddAddressStyle.container}>
        <View style={AddAddressStyle.line}>
          <Text>地址信息</Text>
          <View style={AddAddressStyle.line}>
            <CheckBox value={isDefault} onValueChange={switchDefault} />
            <Text>默认收货地址</Text>
          </View>
        </View>
        <View style={AddAddressStyle.line}>
          <View style={AddAddressStyle.label}>
            <Text>收件人</Text>
            <Text style={{color: 'red'}}>*</Text>
          </View>
          <TextInput
            style={AddAddressStyle.input}
            value={name}
            onChangeText={changeName}
            placeholder="收件人名字"
          />
        </View>
        <View style={AddAddressStyle.line}>
          <View style={AddAddressStyle.label}>
            <Text>手机号</Text>
            <Text style={{color: 'red'}}>*</Text>
          </View>
          <TextInput
            style={AddAddressStyle.input}
            value={tel}
            onChangeText={changeTel}
            placeholder="手机号"
          />
        </View>
        <View style={AddAddressStyle.line}>
          <View style={AddAddressStyle.label}>
            <Text>所在地区</Text>
            <Text style={{color: 'red'}}>*</Text>
          </View>
          <Picker
            data={districtList}
            cols={3}
            value={district}
            onChange={changeDistrict}>
            <Text style={AddAddressStyle.input}>
              {district.length > 0 ? district.join(' ') : '省、市、区、街道'}
            </Text>
          </Picker>
        </View>
        <View style={AddAddressStyle.line}>
          <View style={AddAddressStyle.label}>
            <Text>详细地址</Text>
            <Text style={{color: 'red'}}>*</Text>
          </View>
          <TextInput
            style={AddAddressStyle.input}
            value={detail}
            onChangeText={changeDetail}
            placeholder="小区、写字楼、门牌号等"
          />
        </View>
        {props.showBtn ? (
          <Pressable style={AddAddressStyle.loadBtn} onPress={submit}>
            <Text style={AddAddressStyle.loadText}>确认</Text>
          </Pressable>
        ) : (
          <></>
        )}
      </View>
    </Provider>
  );
}

const AddAddressStyle = StyleSheet.create({
  container: {
    display: 'flex',
    padding: 20,
    backgroundColor: '#f8f8f8',
    gap: 10,
    flex: 1,
  },
  line: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    display: 'flex',
    flexDirection: 'row',
  },
  input: {
    width: 280,
    height: 40,
    backgroundColor: '#efefef',
    borderRadius: 5,
    padding: 10,
  },
  loadBtn: {
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: '#2196F3',
    display: 'flex',
    alignItems: 'center',
    marginTop: 10,
  },
  loadText: {
    color: '#fff',
    fontWeight: '500',
  },
});
