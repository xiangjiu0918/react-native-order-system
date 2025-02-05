import { Alert } from "react-native";

export default () => {
  Alert.alert('提示', '服务器繁忙，请稍后再试', [
    {
      text: '好的',
      style: 'cancel',
    },
  ]);
}