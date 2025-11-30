import { StyleSheet } from "react-native";
import { Colors, primaryBase } from "./Colors";
// import {Colors, primaryBase} from "@/constants/Colors";

export const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
    margin: 10,
    marginTop:10
  },
  header: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: 'DMSansBold',
    // color:'#212B36'
  },
  pillButton: {
    padding: 10,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textLink: {
    color: primaryBase,
    fontSize: 18,
    fontWeight: "500",
  },
  descriptionText: {
    fontSize: 14,
    marginTop: 5,
    color: '#637381',
    fontFamily: 'DMSansRegular'

  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    fontFamily: 'DMSansBold'

  },
  pillButtonSmall: {
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonTextSmall: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 20,
    marginBottom: 10,
  },
  block: {
    marginHorizontal: 20,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    gap: 20,
  },
});