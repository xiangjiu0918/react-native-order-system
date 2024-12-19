import { FlatList, StyleSheet } from 'react-native'
import React from 'react'
import Card, { CardProp } from './components/Card'

export default function Index({ data }: {data: CardProp[]}) {
  return (
    <FlatList
      data={data}
      renderItem={({item}) => <Card {...item} />}
      numColumns={2}
      columnWrapperStyle={CardListStyle.columnStyle}
      contentContainerStyle={{gap: 5}}
    />
  )
}

const CardListStyle = StyleSheet.create({
  columnStyle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})