import {
  View,
  Text,
  Image,
  StyleSheet,
  LayoutChangeEvent,
  Pressable,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import PayPopup from '@/components/PayPopup/Index';

dayjs.extend(duration);

export interface CardProp {
  id: number;
  shop: string;
  title: string;
  type: string;
  price: string;
  num: number;
  status: STATUS;
  time?: duration.Duration;
}

export enum STATUS {
  PAY,
  UNPAY,
  CANCEL,
}

export default function Card(props: CardProp) {
  let cardWidth = 0;
  let priceWidth = 0;
  let havePay = props.status === STATUS.PAY;
  let timer: NodeJS.Timeout;
  const [width, setWidth] = useState(0);
  const [limit, setLimit] = useState(props.time || dayjs.duration(15, 'm'));
  const [payVisible, changePayVisible] = useState(false);
  let cntLimit = props.time || dayjs.duration(15, 'm');
  const handlePriceWidth = (event: LayoutChangeEvent) => {
    priceWidth = event.nativeEvent.layout.width;
    if (cardWidth > 0) {
      setWidth(cardWidth - priceWidth - 100);
    }
  };
  const handleCardWidth = (event: LayoutChangeEvent) => {
    cardWidth = event.nativeEvent.layout.width;
    if (priceWidth > 0) {
      setWidth(cardWidth - priceWidth - 100);
    }
  };
  useEffect(() => {
    if (timer === undefined && havePay === false) {
      timer = setInterval(() => {
        // setInterval的回调函数在初始化时就被定义，所以无法感知到状态的更新
        //需要用useRef或者是辅助变量来解决
        if (cntLimit.asSeconds() === 0) {
          clearInterval(timer);
        } else {
          cntLimit = cntLimit.subtract(1, 's');
          setLimit(cntLimit);
        }
      }, 1000);
    }
  }, []);
  return (
    <>
      <View style={CardStyle.container}>
        <View style={CardStyle.topBar}>
          <Text style={CardStyle.main}>{props.shop}</Text>
          <Text style={CardStyle.status}>
            {havePay === true
              ? '买家已付款'
              : limit.asSeconds() === 0
              ? '订单已取消'
              : '订单未支付'}
          </Text>
        </View>
        <View style={CardStyle.detail} onLayout={handleCardWidth}>
          <Image
            style={CardStyle.image}
            source={require('@/static/defaultAvator.jpeg')}
          />
          <View style={{width, overflow: 'hidden'}}>
            <Text style={CardStyle.main} numberOfLines={1}>
              {props.title}
            </Text>
            <Text>{props.type}</Text>
          </View>
          <View onLayout={handlePriceWidth} style={{alignItems: 'flex-end'}}>
            <Text style={CardStyle.main}>{props.price}</Text>
            <Text>x{props.num}</Text>
          </View>
        </View>
        {havePay === true || limit.asSeconds() === 0 ? (
          <></>
        ) : (
          <View style={CardStyle.bottomBar}>
            <Text>支付时间剩余{limit.format('mm:ss')}</Text>
            <Pressable
              style={CardStyle.button}
              onPress={() => changePayVisible(true)}>
              <Text style={{color: '#2196F3'}}>去支付</Text>
            </Pressable>
          </View>
        )}
      </View>
      <PayPopup
        visible={payVisible}
        handleVisible={() => changePayVisible(false)}
      />
    </>
  );
}

const CardStyle = StyleSheet.create({
  container: {
    padding: 15,
    gap: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  detail: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
  },
  image: {
    height: 80,
    width: 80,
  },
  main: {
    color: 'black',
    fontSize: 18,
  },
  bottomBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  status: {
    color: '#2196F3',
  },
  topBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
