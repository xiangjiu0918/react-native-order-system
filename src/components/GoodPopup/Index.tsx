import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
  ScrollView,
  ToastAndroid,
} from "react-native";
import React, {useEffect, useState, useRef} from "react";
import Icons from "react-native-vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Popup, {type BasePopupProp} from "@/components/Popup/Index";
import AddressPopup from "@/components/AddressPopup/Index";
import LoadPopup from "@/components/LoadPopup/Index";
import PayPopup from "@/components/PayPopup/Index";
import {useAppSelector, useAppDispatch} from "@/store/hooks";
import {initList} from "@/store/slice/addressSlice";
import {EventRegister} from "react-native-event-listeners";
import axios from "@/utils/axios";

interface TypesItem {
  id: number;
  name: string;
  thumbnailUrl: string;
  stockout: boolean;
}

interface SizesItem {
  id: number;
  name: string;
  stockout: boolean;
}

interface Categories {
  [key: string]: {
    inventory: number;
    price: number;
  };
}
interface GoodPopupProp extends BasePopupProp {
  mode: "preSelect" | "purchase";
  id: number;
  sizes: SizesItem[];
  types: TypesItem[];
  categories: Categories;
  defaultPrice: number;
  defaultThumbnail: string;
}

interface GoodMap {
  [key: string]: GoodItem;
}

interface GoodItem {
  typeId: number;
  sizeId: number;
  num: number;
}

let {width: windowWidth, height: windowHeight} = Dimensions.get("window");

export default function GoodPopup(props: GoodPopupProp) {
  const {username, userId} = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const address = useAppSelector(state => state.address);
  const [types, changeTypes] = useState(props.types);
  const [sizes, changeSizes] = useState(props.sizes);
  const [price, changePrice] = useState(props.defaultPrice);
  const [selectAddress, changeSelectAddress] = useState(
    address.default === null
      ? address.list[0]
      : address.list.find(item => item.id === address.default),
  );
  const [selectTypeId, changeTypeId] = useState(-1);
  const [selectSizeId, changeSizeId] = useState(-1);
  const [num, changeNum] = useState(1);
  const [addressVisible, changeAddressVisible] = useState(false);
  const [loadVisible, changeLoadVisible] = useState(false);
  const [payVisible, changePayVisible] = useState(false);
  const id = "1";
  const prefill = useRef<GoodMap>({});
  const {categories} = props;
  useEffect(() => {
    if (global.token) {
      axios.get("/addresses/default").then(res => {
        const {address} = res.data?.data;
        if (address !== null) {
          if (address?.default === true) {
            changeSelectAddress(address);
            dispatch(initList({list: [address], default: address.id}));
          } else {
            changeSelectAddress(address);
            dispatch(initList({list: [address], default: null}));
          }
        }
      });
    }
    getPreFilling();
    let preFillListener = EventRegister.addEventListener("updatePreFill", () =>
      getPreFilling(),
    );
    return () => {
      EventRegister.removeEventListener(preFillListener as string);
    };
  }, []);
  useEffect(() => {
    // useState初始化时，商品接口还没返回数据，所以state初始化为空
    // 要在接口返回数据后重新初始化
    changeTypes(props.types);
    changeSizes(props.sizes);
    changePrice(props.defaultPrice);
  }, [props]);
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
    // 预选信息和用户id、商品id有关
    const res = await AsyncStorage.getItem(`pre-filling:${userId}:${id}`);
    if (res !== null) {
      prefill.current = JSON.parse(res);
      const {num, typeId, sizeId} = prefill.current[id];
      changeNum(num);
      changeTypeId(typeId);
      changeSizeId(sizeId);
    }
  };
  const handleBtnPress = () => {
    if (username === undefined || selectAddress === undefined)
      handleLoadVisible();
    else {
      prefill.current[id] = {
        sizeId: selectSizeId,
        typeId: selectTypeId,
        num,
      };
      AsyncStorage.setItem(
        `pre-filling:${userId}:${id}`,
        JSON.stringify(prefill.current),
      );
      EventRegister.emitEvent("updatePreFill");
      if (props.mode === "purchase") handlePayVisible();
    }
  };
  const handlePressType = (typeId: number) => {
    // 根据选择的商品类型判断size是否可选
    return () => {
      if (selectTypeId === typeId) {
        // 取消逻辑
        changeTypeId(-1);
        // 改回默认价格
        changePrice(props.defaultPrice);
        if (selectSizeId === -1) {
          // 展示接口传来的size和type
          changeTypes(props.types);
          changeSizes(props.sizes);
        } else {
          // 展示单选size的结果
          const newTypes = types.map(item => {
            return {
              ...item,
              stockout:
                categories[`${item.id}:${selectSizeId}`].inventory <= 0
                  ? true
                  : false,
            };
          });
          changeTypes(newTypes);
          changeSizes(props.sizes);
        }
      } else {
        // 只有单选types时才需要过滤size，因为已经选择的size一定是可选的
        if (sizes.length > 0 && selectSizeId === -1) {
          const newSizes = sizes.map(item => {
            return {
              ...item,
              stockout:
                categories[`${typeId}:${item.id}`].inventory <= 0
                  ? true
                  : false,
            };
          });
          changeSizes(newSizes);
        } else {
          // 修改价格
          changePrice(categories[`${typeId}:${selectSizeId}`].price);
        }
        changeTypeId(typeId);
      }
    };
  };
  const handlePressSize = (sizeId: number) => {
    // 根据选择的商品类型判断size是否可选
    return () => {
      if (selectSizeId === sizeId) {
        // 取消逻辑
        changeSizeId(-1);
        // 改回默认价格
        changePrice(props.defaultPrice);
        if (selectTypeId === -1) {
          // 展示接口传来的size和type
          changeTypes(props.types);
          changeSizes(props.sizes);
        } else {
          // 展示及单选Type的结果
          const newSizes = sizes.map(item => {
            return {
              ...item,
              stockout:
                categories[`${selectTypeId}:${item.id}`].inventory <= 0
                  ? true
                  : false,
            };
          });
          changeTypes(props.types);
          changeSizes(newSizes);
        }
      } else {
        if (types.length > 0 && selectTypeId === -1) {
          const newTypes = types.map(item => {
            return {
              ...item,
              stockout:
                categories[`${item.id}:${sizeId}`].inventory <= 0
                  ? true
                  : false,
            };
          });
          changeTypes(newTypes);
        } else {
          // 修改价格
          changePrice(categories[`${selectTypeId}:${sizeId}`].price);
        }
        changeSizeId(sizeId);
      }
    };
  };
  const addNum = () => {
    if (
      (types.length > 0 && selectTypeId === -1) ||
      (sizes.length > 0 && selectSizeId === -1)
    ) {
      // 没有选全参数，不能增加数量
      ToastAndroid.show("请选择商品分类", ToastAndroid.SHORT);
    } else {
      if (num < categories[`${selectTypeId}:${selectSizeId}`].price) {
        changeNum(num + 1);
      } else {
        ToastAndroid.show("数量已达上限", ToastAndroid.SHORT);
      }
    }
  };
  return (
    <>
      <Popup
        {...props}
        btnText={props.mode === "preSelect" ? "提交预选信息" : "立即下单"}
        btnCallBack={handleBtnPress}
        preventDefault={username === undefined}>
        {username !== undefined ? (
          <Pressable
            style={PopupStyle.addressWrap}
            onPress={handleAddressVisible}>
            <View
              style={[PopupStyle.flexBox, {justifyContent: "space-between"}]}>
              <View style={[PopupStyle.flexBox, {gap: 10}]}>
                <Icons name="enviromento" size={20} color="black" />
                <Text
                  style={{
                    fontSize: 15,
                    color: "black",
                    height: 20,
                    lineHeight: 20,
                  }}>
                  {selectAddress
                    ? `${selectAddress.name} ${selectAddress.detail}`
                    : "暂无收货地址"}
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
              source={{uri: props.defaultThumbnail}}
            />
            <View style={{justifyContent: "space-between"}}>
              <Text style={PopupStyle.price}>￥{price}</Text>
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
                    {width: 50, justifyContent: "center"},
                  ]}>
                  <Text>{num}</Text>
                </View>
                <Pressable style={PopupStyle.numBtn} onPress={addNum}>
                  <Text>+</Text>
                </Pressable>
                <Text style={{paddingLeft: 10}}>有货</Text>
              </View>
            </View>
          </View>
          {types.length > 0 ? (
            <>
              <Text style={PopupStyle.typeSizeTitle}>颜色分类（3）</Text>
              <View style={[PopupStyle.flexBox, {gap: 10, flexWrap: "wrap"}]}>
                {types.map(item => (
                  <Pressable
                    key={item.id}
                    disabled={item.stockout}
                    style={[
                      PopupStyle.flexBox,
                      selectTypeId === item.id
                        ? PopupStyle.typeWrapSelect
                        : PopupStyle.typeWrap,
                      item.stockout ? {opacity: 0.5} : {opacity: 1},
                    ]}
                    onPress={handlePressType(item.id)}>
                    <Image
                      style={{height: 30, width: 30}}
                      resizeMode="contain"
                      source={{uri: item.thumbnailUrl}}
                    />
                    <Text
                      style={[
                        {maxWidth: windowWidth - 60, paddingHorizontal: 10},
                        selectTypeId === item.id
                          ? {color: "white"}
                          : {color: "black"},
                      ]}>
                      {item.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <></>
          )}
          {sizes.length > 0 ? (
            <>
              <Text style={PopupStyle.typeSizeTitle}>尺码</Text>
              <View style={[PopupStyle.flexBox, {gap: 10, flexWrap: "wrap"}]}>
                {sizes.map(item => (
                  <Text
                    key={item.id}
                    disabled={item.stockout}
                    style={[
                      PopupStyle.flexBox,
                      selectSizeId === item.id
                        ? PopupStyle.typeWrapSelect
                        : PopupStyle.typeWrap,
                      selectSizeId === item.id
                        ? {color: "white"}
                        : {color: "black"},
                      item.stockout ? {opacity: 0.5} : {opacity: 1},
                      {paddingHorizontal: 15, paddingVertical: 5},
                    ]}
                    onPress={handlePressSize(item.id)}>
                    {item.name}
                  </Text>
                ))}
              </View>
            </>
          ) : (
            <></>
          )}
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
    flexDirection: "row",
    alignItems: "flex-end",
  },
  modal: {
    width: windowWidth,
    height: windowHeight,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    position: "absolute",
  },
  topBar: {
    height: 40,
    flexDirection: "row",
    width: windowWidth,
    justifyContent: "center",
    position: "relative",
    backgroundColor: "white",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  close: {
    position: "absolute",
    right: 15,
    paddingTop: 15,
  },
  title: {
    height: 25,
    marginTop: 15,
  },
  addressWrap: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 5,
    marginBottom: 10,
  },
  flexBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectDetailWrap: {
    backgroundColor: "white",
    padding: 15,
    gap: 10,
  },
  pictureNumWrap: {
    height: 80,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },
  picture: {
    height: 80,
    width: 80,
    borderRadius: 5,
  },
  price: {
    color: "#ff6f43",
    fontSize: 25,
    fontWeight: "500",
    lineHeight: 30,
  },
  numBtn: {
    height: 30,
    width: 30,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  typeWrap: {
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: "#f1f1f1",
  },
  typeWrapSelect: {
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: "#ff6f43",
  },
  typeSizeTitle: {
    color: "black",
    fontWeight: "600",
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    width: windowWidth - 30,
    backgroundColor: "#ff6f43",
    paddingVertical: 10,
    borderRadius: 20,
  },
});
