import { ScrollView, View, Text, StyleSheet } from 'react-native';
import React from 'react';
import Card from './components/Card'

export default function Unpay() {
  return (
    // <ScrollView style={UnpayStyle.container}>
    //   <View style={UnpayStyle.scroll}>
    //     <Card />
    //     <Card />
    //   </View>
    // </ScrollView>
    <View>
      <Text>unpay</Text>
    </View>
  )
}

const UnpayStyle = StyleSheet.create({
  container: {
    flex: 1,
  }, scroll: {
    padding: 10,
    gap: 10,
  },
});