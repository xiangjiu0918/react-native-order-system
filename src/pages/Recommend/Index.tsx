import {View, Text, StyleSheet, FlatList} from "react-native";
import React, {useEffect, useState, useRef} from "react";
import type {NavigationProp} from "@react-navigation/native";
import {showBottomBar, hideBottomBar} from "@/store/slice/bottomBarSlice";
import {useAppSelector, useAppDispatch} from "@/store/hooks";
import Search from "./components/Search";
import {CardProp} from "@/components/CardList/components/Card";
import CardList from "@/components/CardList/Index";
import axios from "@/utils/axios";
import alert from "@/utils/alert";
import {EventRegister} from "react-native-event-listeners";

export default function Recommend({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) {
  const dispatch = useAppDispatch();
  const [goods, setGoods] = useState<CardProp[]>([]);
  const currentPage = useRef(1);
  const end = useRef(false);
  const getDataRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const pageSize = 10;
  async function getGoodData() {
    try {
      if (!end.current) {
        const res = await axios.get("/goods", {
          params: {
            currentPage: currentPage.current,
            pageSize,
          },
        });
        const newGoods = [...goods, ...res.data?.data?.goods];
        setGoods(newGoods);
        if (currentPage.current * pageSize < res.data?.data?.total) {
          currentPage.current += 1;
        } else {
          end.current = true;
        }
      }
    } catch (e) {
      console.log("e", e);
      alert();
    }
  }
  getDataRef.current = getGoodData;
  useEffect(() => {
    navigation.addListener("focus", () => {
      dispatch(showBottomBar());
    });
    navigation.addListener("blur", () => {
      dispatch(hideBottomBar());
    });
  }, [navigation]);
  useEffect(() => {
    getGoodData();
    // 确保能获取到最新state
    const goodListener = EventRegister.addEventListener(
      "getData",
      () => getDataRef.current,
    );
    return () => {
      EventRegister.removeEventListener(goodListener as string);
    };
  }, []);
  return (
    <View style={RecommendStyle.container}>
      <Search />
      <CardList data={goods} />
    </View>
  );
}

const RecommendStyle = StyleSheet.create({
  container: {
    padding: 10,
    gap: 10,
    flex: 1,
  },
});
