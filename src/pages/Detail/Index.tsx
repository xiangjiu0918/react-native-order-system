import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
} from "react-native";
import React, {useState, useEffect, useRef} from "react";
import Swiper from "react-native-swiper";
import Icons from "react-native-vector-icons/AntDesign";
import GoodPopup from "@/components/GoodPopup/Index";
import axios from "@/utils/axios";
import alert from "@/utils/alert";

interface DetailProp {
  route: {
    params: {
      id: string;
    };
  };
}

const windowWidth = Dimensions.get("window").width;

export default function Index({
  route: {
    params: {id},
  },
}: DetailProp) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [sale, setSale] = useState(0);
  const [district, setDistrict] = useState("");
  const [postage, setPostage] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string[]>([]);
  const [preSelectVisible, changePreSelectVisible] = useState(false);
  const [purchaseVisible, changePurchaseVisible] = useState(false);
  const [onSale, changeOnSale] = useState(true);
  const typesRef = useRef([]);
  const sizesRef = useRef([]);
  const categoriesRef = useRef([]);
  const handlePreSelectVisible = () => {
    changePreSelectVisible(!preSelectVisible);
  };
  const handlePurchaseVisible = () => {
    changePurchaseVisible(!purchaseVisible);
  };
  useEffect(() => {
    initData();
  }, []);
  async function initData() {
    try {
      const res = await axios.get(`goods/${id}`);
      // console.log("res", res.data.data);
      const {name, sale, district, postage, previewUrl, price} = res.data.data.good;
      const {types, sizes, categories} = res.data.data;
      setName(name);
      setPrice(price);
      setSale(sale);
      setDistrict(district);
      setPostage(postage);
      setPreviewUrl(previewUrl);
      typesRef.current = types;
      sizesRef.current = sizes;
      categoriesRef.current = categories;
    } catch (e) {
      console.log(e);
      alert();
    }
  }
  return (
    <>
      <ScrollView style={DetailStyle.container}>
        {previewUrl.length > 0 ? (
          <Swiper loop={true} height={windowWidth}>
            {previewUrl.map((item, index) => (
              <Image
                key={index}
                style={DetailStyle.image}
                resizeMode="contain"
                source={{uri: item}}
              />
            ))}
          </Swiper>
        ) : (
          <Swiper loop={true} height={windowWidth}>
            <Image
              style={DetailStyle.image}
              resizeMode="contain"
              source={require("@/static/defaultAvator.jpeg")}
            />
            <Image
              style={DetailStyle.image}
              resizeMode="contain"
              source={require("@/static/defaultAvator.jpeg")}
            />
          </Swiper>
        )}
        <View style={DetailStyle.detailWrap}>
          <View style={DetailStyle.textWrap}>
            <View style={DetailStyle.priceSellWrap}>
              <Text style={DetailStyle.price}>￥{price}</Text>
              <Text>已售 {sale}</Text>
            </View>
            <Text style={DetailStyle.title}>{name}</Text>
            <View style={DetailStyle.subBar}>
              <Icons name="enviromento" />
              <Text>{district} 快递：{postage === 0 ? "免运费" : postage}</Text>
            </View>
            <View style={DetailStyle.subBar}>
              <Icons name="hearto" />
              <Text>七天无理由退货 | 极速退款</Text>
            </View>
            <View style={DetailStyle.subBar}>
              <Icons name="profile" />
              <Text>品牌 | 货号 | 出售状态 | 尺码 | 颜色分类</Text>
            </View>
          </View>
          <View style={DetailStyle.pictureWrap}>
            <Text style={DetailStyle.pictureBar}>宝贝详情</Text>
            {previewUrl.length > 0 ? (
              previewUrl.map((item, index) => (
                <Image
                  key={index}
                  style={DetailStyle.image}
                  resizeMode="contain"
                  source={{uri: item}}
                />
              ))
            ) : (
              <Image
                style={DetailStyle.image}
                resizeMode="contain"
                source={require("@/static/defaultAvator.jpeg")}
              />
            )}
          </View>
        </View>
      </ScrollView>
      <View style={DetailStyle.bottomBar}>
        <View style={DetailStyle.leftWrap}>
          <View style={DetailStyle.iconWrap}>
            <Icons name="isv" size={20} />
            <Text style={DetailStyle.iconText}>店铺</Text>
          </View>
          <View style={DetailStyle.iconWrap}>
            <Icons name="aliwangwang-o1" size={20} />
            <Text style={DetailStyle.iconText}>客服</Text>
          </View>
          <View style={DetailStyle.iconWrap}>
            <Icons name="staro" size={20} />
            <Text style={DetailStyle.iconText}>收藏</Text>
          </View>
        </View>
        <View style={DetailStyle.buttonGroup}>
          <Pressable
            style={DetailStyle.buttonWrap}
            onPress={handlePreSelectVisible}>
            <Text style={DetailStyle.buttonText}>预选商品</Text>
          </Pressable>
          <Pressable
            style={[
              DetailStyle.buttonWrap,
              {backgroundColor: "red"},
              onSale ? {opacity: 1} : {opacity: 0.5},
            ]}
            onPress={handlePurchaseVisible}
            disabled={!onSale}>
            <Text style={DetailStyle.buttonText}>立即秒杀</Text>
            <Text
              style={[DetailStyle.buttonText, {fontSize: 10, marginLeft: 5}]}>
              15: 00
            </Text>
          </Pressable>
        </View>
      </View>
      <GoodPopup
        visible={preSelectVisible}
        handleVisible={handlePreSelectVisible}
        types={typesRef.current}
        sizes={sizesRef.current}
        categories={categoriesRef.current}
        defaultPrice={price}
        mode="preSelect"
      />
      <GoodPopup
        visible={purchaseVisible}
        handleVisible={handlePurchaseVisible}
        types={typesRef.current}
        sizes={sizesRef.current}
        categories={categoriesRef.current}
        defaultPrice={price}
        mode="purchase"
      />
    </>
  );
}

const DetailStyle = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    height: windowWidth,
    width: windowWidth,
  },
  detailWrap: {
    flex: 1,
    gap: 10,
  },
  textWrap: {
    backgroundColor: "white",
    padding: 10,
    gap: 10,
  },
  pictureWrap: {
    backgroundColor: "white",
  },
  priceSellWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  price: {
    color: "#ff6f43",
    fontSize: 25,
    fontWeight: "bold",
  },
  title: {
    color: "black",
    fontSize: 20,
    fontWeight: "500",
    paddingBottom: 10,
  },
  subBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  typeSelectBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  type: {
    backgroundColor: "#eeeeee",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  select: {
    color: "#ff6f43",
  },
  pictureBar: {
    padding: 10,
    color: "black",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  leftWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  iconWrap: {
    alignItems: "center",
  },
  iconText: {
    fontSize: 10,
  },
  buttonGroup: {
    flexDirection: "row",
    borderRadius: 5,
    overflow: "hidden",
  },
  buttonWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#ff6f43",
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
