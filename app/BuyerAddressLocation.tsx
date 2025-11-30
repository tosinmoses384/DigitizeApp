import React from 'react';
import {View} from 'react-native';
import AddPaymentAddress from './(authenticated)/AddPaymentAddress';

const BuyerAddressLocation = () => {
  return (
    <View style={{flex: 1}}>
      <AddPaymentAddress />
    </View>
  );
};

export default BuyerAddressLocation;
