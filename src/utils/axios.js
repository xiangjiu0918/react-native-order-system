import axios from 'axios';
const env = process.env.NODE_ENV || 'development';
import config from '@/../config/config.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAppSelector, useAppDispatch} from '@/store/hooks';

const instance = axios.create(config[env]);
instance.interceptors.request.use(
  async function (config) {
    if (global.token !== undefined) {
      config.headers.token = global.token;
    }
    return config;
  },
  function (err) {
    return Promise.reject(err);
  },
);

// instance.interceptors.response.use(
//   res => res,
//   err => {
//     // 处理token过期或错误
//     if (err.response?.data?.message === "认证失败") {

//     }
//   }
// )
export default instance;
