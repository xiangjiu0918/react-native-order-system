import { FlatList, StyleSheet } from 'react-native';
import React from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import Card, { CardProp, STATUS } from './components/Card';

dayjs.extend(duration);

interface ItemLayoutRet {
  length: number,
  offset: number,
  index: number,
};

export default function Total() {
  const data: CardProp[] = [{
    id: 1,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.PAY,
  }, {
    id: 2,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.UNPAY,
    time: dayjs.duration(1, 'm'),
  }, {
    id: 3,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.PAY,
  }, {
    id: 4,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.UNPAY,
    time: dayjs.duration(1, 'm'),
  }, {
    id: 5,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.PAY,
  }, {
    id: 6,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.UNPAY,
    time: dayjs.duration(1, 'm'),
  }, {
    id: 7,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.PAY,
  }, {
    id: 8,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.UNPAY,
    time: dayjs.duration(1, 'm'),
  },  {
    id: 9,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.PAY,
  }, {
    id: 10,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.UNPAY,
    time: dayjs.duration(1, 'm'),
  }, {
    id: 11,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.PAY,
  }, {
    id: 12,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.UNPAY,
    time: dayjs.duration(1, 'm'),
  }, {
    id: 13,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.PAY,
  }, {
    id: 14,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.UNPAY,
    time: dayjs.duration(1, 'm'),
  }, {
    id: 15,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.PAY,
  }, {
    id: 16,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.UNPAY,
    time: dayjs.duration(1, 'm'),
  }, {
    id: 17,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.PAY,
  }, {
    id: 18,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.UNPAY,
    time: dayjs.duration(1, 'm'),
  },  {
    id: 19,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.PAY,
  }, {
    id: 20,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.UNPAY,
    time: dayjs.duration(1, 'm'),
  }, {
    id: 21,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.PAY,
  }, {
    id: 22,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.UNPAY,
    time: dayjs.duration(1, 'm'),
  }, {
    id: 23,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.PAY,
  }, {
    id: 24,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.UNPAY,
    time: dayjs.duration(1, 'm'),
  }, {
    id: 25,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.PAY,
  }, {
    id: 26,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.UNPAY,
    time: dayjs.duration(1, 'm'),
  }, {
    id: 27,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.PAY,
  }, {
    id: 28,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.UNPAY,
    time: dayjs.duration(1, 'm'),
  },  {
    id: 29,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.PAY,
  }, {
    id: 30,
    shop: 'girlcult旗舰店',
    title: '【店铺专属】Grilcult精华唇霜哑光',
    type: 'M62墨客【纯正口黑】',
    price: '￥99',
    num: 1,
    status: STATUS.UNPAY,
    time: dayjs.duration(1, 'm'),
  }];

  return (
    <FlatList
      contentContainerStyle={TotalStyle.scroll}
      data={data}
      renderItem={({item}) => <Card {...item} />}
    />
  )
}

const TotalStyle = StyleSheet.create({
  scroll: {
    padding: 10,
    gap: 10,
  },
});