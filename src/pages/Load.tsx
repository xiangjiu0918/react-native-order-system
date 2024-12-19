import React from 'react';
import LoadItem from '@/components/LoadItem/Index';
import {NavigationProp} from '@react-navigation/native';

export default function Load({navigation}: {navigation: NavigationProp<any>}) {
  return <LoadItem handleLoad={() => navigation.goBack()} />;
}
