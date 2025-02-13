import {View, Text} from "react-native";
import React from "react";
import {NavigationProp} from "@react-navigation/native";
import {type AddressStore} from "@/store/slice/addressSlice";
import AddAddressItem from "@/components/AddAddressItem/Index";

export default function AddAddress(props: {
  navigation?: NavigationProp<any>;
  route?: {params: AddressStore};
}) {
  return <AddAddressItem {...props} showBtn={true} />;
}
