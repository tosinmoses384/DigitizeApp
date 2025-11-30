import AppTabWrapper from "@components/AppTabWrapper";
import EmptyState from "@components/EmptyState";
import LineLoader from "@components/LineLoader";
import ListWithChevronRight from "@components/ListWithChevronRight";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { getEmptyStateCountLoader } from "@helper/get-empty-count-loader/getEmptyCountLoader";
import helpCenterServices from "@services/features/help-center-service/helpCenterService";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Platform, Text, View } from "react-native";
import { useI18n } from "@hooks/use-i18n";

const HelpListScreen = () => {
  const { t } = useI18n();
  const { id }: any = useLocalSearchParams();

  const [pageDatas, setPageDatas]: any = useState([]);

  const [loader, setLoader] = useState(false);

  useEffect(() => {
    setPageDatas([]);

    if (id) {
      setLoader(true);
      let detailsReq: any = {
        languageCode: "",
        PageCategoryId: id,
        PageSize: 50,
        PageToken: "",
      };
      helpCenterServices
        ?.helpCenterPages?.(detailsReq)
        .then((res: any) => {
          setLoader(false);
          setPageDatas(res?.data?.dataset);
        })
        .catch((error) => {
          setLoader(false);
        });
    }
  }, [id]);

  const loaderState = (
    <View style={{ paddingHorizontal: 16 }}>
      {getEmptyStateCountLoader(8)?.map((list, index) => {
        return (
          <View
            style={{
              marginBottom: 8,
              height: 50,
            }}
            key={index}
          >
            <LineLoader />
          </View>
        );
      })}
    </View>
  );

  return (
    <AppTabWrapper>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
        }}
      >
        <StackHeader
          title={pageDatas[0]?.pageCategory}
          onPress={() => router.back()}
          isShowHeaderShadow
        />
        {loader ? (
          loaderState
        ) : (
          <ScrollView style={styles.wrapper}>
            {pageDatas?.length ? (
              <View style={styles.container}>
                {pageDatas?.map((list: any, index: number) => {
                  return (
                    <ListWithChevronRight
                      key={index}
                      title={list?.title}
                      onPress={() =>
                        router.push(
                          `/ViewHelpDetails/${list?.title}?pageUrl=${list?.pageUrl}`
                        )
                      }
                    />
                  );
                })}
              </View>
            ) : (
              <EmptyState
                title={t('helpCenter.unavailable')}
                subtitle={t('helpCenter.unavailableDescription')}
              />
            )}
          </ScrollView>
        )}
      </View>
    </AppTabWrapper>
  );
};

export default HelpListScreen;

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.background,
    flex: 1,
  },
  container: {
    padding: 12,
    backgroundColor: "white",
    borderRadius: 12,
  },
});
