import React from "react";
import { Text, View } from "react-native";
import NewPost from "../newPost";
import { useLocalSearchParams } from "expo-router";

const EditPost = () => {
  const { id }: any = useLocalSearchParams();

  return (
    <View style={{ flex: 1 }}>
      <NewPost isEditPost editId={id} />
    </View>
  );
};

export default EditPost;
