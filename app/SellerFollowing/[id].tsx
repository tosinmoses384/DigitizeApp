import React from "react";
import { useLocalSearchParams } from "expo-router";
import SellerFollowersFollowing from "../../components/SellerFollowersFollowing";

const SellerFollowing = () => {
  const { id }: any = useLocalSearchParams();

  return (
    <SellerFollowersFollowing 
      userId={id} 
      type="following" 
    />
  );
};

export default SellerFollowing;
