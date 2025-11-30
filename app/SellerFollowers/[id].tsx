import React from "react";
import { useLocalSearchParams } from "expo-router";
import SellerFollowersFollowing from "../../components/SellerFollowersFollowing";

const SellerFollowers = () => {
  const { id }: any = useLocalSearchParams();

  return (
    <SellerFollowersFollowing 
      userId={id} 
      type="followers" 
    />
  );
};

export default SellerFollowers;
