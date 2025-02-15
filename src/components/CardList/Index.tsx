import {FlatList, StyleSheet} from "react-native";
import React from "react";
import Card, {CardProp} from "./components/Card";
import {EventRegister} from "react-native-event-listeners";

export default function Index({data}: {data: CardProp[]}) {
  return (
    <FlatList
      data={data}
      renderItem={({item}) => <Card {...item} />}
      numColumns={2}
      columnWrapperStyle={CardListStyle.columnStyle}
      contentContainerStyle={{gap: 5}}
      onEndReached={() => EventRegister.emit("getData")}
      onEndReachedThreshold={0.5}
    />
  );
}

const CardListStyle = StyleSheet.create({
  columnStyle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
