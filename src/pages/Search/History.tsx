import { View, Text, StyleSheet, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icons from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventRegister } from 'react-native-event-listeners';

export default function History() {
  const [history, changeHistory] = useState([]);
  useEffect(() => {
    getHistory();
    EventRegister.addEventListener('updateHistory', getHistory);
  }, [])
  const getHistory = async() => {
    const res = await AsyncStorage.getItem('history');
    if(res !== null) {
      (changeHistory as React.Dispatch<React.SetStateAction<string[]>>)(res.split(';'));
    }
  }
  const deleteHistory = () => {
    changeHistory([]);
    AsyncStorage.setItem('history', '');
  }
  return (
    <View style={HistoryStyle.container}>
      <View style={HistoryStyle.flexRow}>
        <Text style={{color: 'black', fontWeight: '500'}}>历史搜索</Text>
        <Pressable style={HistoryStyle.delete} onPress={deleteHistory}>
          <Icons name='delete' />
        </Pressable>
      </View>
      <View style={HistoryStyle.historyWrap}>
        {
          history.map((item, index) => {
            return (
              <Text
                key={index}
                style={HistoryStyle.label}
                numberOfLines={1}
                onPress={() => EventRegister.emitEvent('changeKeyWord', item)}
              >
                {item}
              </Text>
            )
          })
        }
      </View>
    </View>
  )
}

const HistoryStyle = StyleSheet.create({
  container: {
    padding: 15,
    gap: 10,
    backgroundColor: 'white',
    flex: 1,
  }, flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }, label: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 10,
    paddingHorizontal: 5,
  }, historyWrap: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap'
  }, delete: {
    height: 20,
    width: 50,
    justifyContent: 'center',
    alignItems: 'flex-end'
  }
})