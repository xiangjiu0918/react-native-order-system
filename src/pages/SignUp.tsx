import React from 'react';
import SignUpItem from '@/components/SignUpItem/Index';
import {NavigationProp} from '@react-navigation/native';

export default function SignUp({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) {
  return <SignUpItem handleSignUp={() => navigation.goBack()} />;
}
