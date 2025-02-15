import {FlatList, StyleSheet} from "react-native";
import React, {useEffect, useState, useRef} from "react";
import {EventRegister} from "react-native-event-listeners";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import Card, {type CardProp} from "./components/Card";
import axios from "@/utils/axios";
import alert from "@/utils/alert";

dayjs.extend(duration);

interface ItemLayoutRet {
  length: number;
  offset: number;
  index: number;
}

export default function Total() {
  const [data, changeData] = useState<CardProp[]>([]);
  const currentPage = useRef(1);
  const end = useRef(false);
  const pageSize = 10;
  useEffect(() => {
    getData();
    const payListener = EventRegister.addEventListener("pay", getData);
    return () => {
      EventRegister.removeEventListener(payListener as string);
    };
  }, []);
  async function getData() {
    try {
      if (!end.current) {
        const res = await axios.get("/orders", {
          params: {
            currentPage: currentPage.current,
            pageSize,
          },
        });
        const newOrders = [...data, ...res.data?.data?.orders];
        changeData(newOrders);
        if (currentPage.current * pageSize < res.data?.data?.total) {
          currentPage.current += 1;
        } else {
          end.current = true;
        }
      }
    } catch (e) {
      alert();
    }
  }
  return (
    <FlatList
      contentContainerStyle={TotalStyle.scroll}
      data={data}
      onEndReached={getData}
      onEndReachedThreshold={0.5}
      renderItem={({item}: {item: CardProp}) => <Card {...item} />}
    />
  );
}

const TotalStyle = StyleSheet.create({
  scroll: {
    padding: 10,
    gap: 10,
  },
});
