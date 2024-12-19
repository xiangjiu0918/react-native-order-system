import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
} from 'react-native';
import React, {useState} from 'react';
import Swiper from 'react-native-swiper';
import Icons from 'react-native-vector-icons/AntDesign';
import GoodPopup from '@/components/GoodPopup/Index';

const windowWidth = Dimensions.get('window').width;

export default function Index() {
  const [preSelectVisible, changePreSelectVisible] = useState(false);
  const [purchaseVisible, changePurchaseVisible] = useState(false);
  const [onSale, changeOnSale] = useState(true);
  const handlePreSelectVisible = () => {
    changePreSelectVisible(!preSelectVisible);
  };
  const handlePurchaseVisible = () => {
    changePurchaseVisible(!purchaseVisible);
  };
  return (
    <>
      <ScrollView style={DetailStyle.container}>
        <Swiper loop={true} height={windowWidth}>
          <Image
            style={DetailStyle.image}
            resizeMode="contain"
            source={require('@/static/defaultAvator.jpeg')}
          />
          <Image
            style={DetailStyle.image}
            resizeMode="contain"
            source={require('@/static/defaultAvator.jpeg')}
          />
          <Image
            style={DetailStyle.image}
            resizeMode="contain"
            source={require('@/static/defaultAvator.jpeg')}
          />
          <Image
            style={DetailStyle.image}
            resizeMode="contain"
            source={require('@/static/defaultAvator.jpeg')}
          />
          <Image
            style={DetailStyle.image}
            resizeMode="contain"
            source={require('@/static/defaultAvator.jpeg')}
          />
          <Image
            style={DetailStyle.image}
            resizeMode="contain"
            source={require('@/static/defaultAvator.jpeg')}
          />
          <Image
            style={DetailStyle.image}
            resizeMode="contain"
            source={require('@/static/defaultAvator.jpeg')}
          />
        </Swiper>
        <View style={DetailStyle.detailWrap}>
          <View style={DetailStyle.textWrap}>
            <View style={DetailStyle.priceSellWrap}>
              <Text style={DetailStyle.price}>￥258</Text>
              <Text>已售 800+</Text>
            </View>
            <Text style={DetailStyle.title}>TELLARO液态蝴蝶厚底马丁靴</Text>
            <View style={DetailStyle.subBar}>
              <Icons name="enviromento" />
              <Text>湖北孝感 快递：免运费</Text>
            </View>
            <View style={DetailStyle.subBar}>
              <Icons name="hearto" />
              <Text>七天无理由退货 | 极速退款</Text>
            </View>
            <View style={DetailStyle.subBar}>
              <Icons name="profile" />
              <Text>品牌 | 货号 | 出售状态 | 尺码 | 颜色分类</Text>
            </View>
            <View style={DetailStyle.typeSelectBar}>
              <View style={DetailStyle.subBar}>
                <Text style={DetailStyle.type}>jsk裙</Text>
                <Text style={DetailStyle.select}>
                  已选：jsk+项链+手袖/白色/s
                </Text>
              </View>
              <Icons name="right" />
            </View>
          </View>
          <View style={DetailStyle.pictureWrap}>
            <Text style={DetailStyle.pictureBar}>宝贝详情</Text>
            <Image
              style={DetailStyle.image}
              resizeMode="contain"
              source={require('@/static/defaultAvator.jpeg')}
            />
            <Image
              style={DetailStyle.image}
              resizeMode="contain"
              source={require('@/static/defaultAvator.jpeg')}
            />
            <Image
              style={DetailStyle.image}
              resizeMode="contain"
              source={require('@/static/defaultAvator.jpeg')}
            />
            <Image
              style={DetailStyle.image}
              resizeMode="contain"
              source={require('@/static/defaultAvator.jpeg')}
            />
            <Image
              style={DetailStyle.image}
              resizeMode="contain"
              source={require('@/static/defaultAvator.jpeg')}
            />
            <Image
              style={DetailStyle.image}
              resizeMode="contain"
              source={require('@/static/defaultAvator.jpeg')}
            />
            <Image
              style={DetailStyle.image}
              resizeMode="contain"
              source={require('@/static/defaultAvator.jpeg')}
            />
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
              {backgroundColor: 'red'},
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
        mode="preSelect"
      />
      <GoodPopup
        visible={purchaseVisible}
        handleVisible={handlePurchaseVisible}
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
    backgroundColor: 'white',
    padding: 10,
    gap: 10,
  },
  pictureWrap: {
    backgroundColor: 'white',
  },
  priceSellWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  price: {
    color: '#ff6f43',
    fontSize: 25,
    fontWeight: 'bold',
  },
  title: {
    color: 'black',
    fontSize: 20,
    fontWeight: '500',
    paddingBottom: 10,
  },
  subBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  typeSelectBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    backgroundColor: '#eeeeee',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  select: {
    color: '#ff6f43',
  },
  pictureBar: {
    padding: 10,
    color: 'black',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  leftWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  iconWrap: {
    alignItems: 'center',
  },
  iconText: {
    fontSize: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    borderRadius: 5,
    overflow: 'hidden',
  },
  buttonWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ff6f43',
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});
