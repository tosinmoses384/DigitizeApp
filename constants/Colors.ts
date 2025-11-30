/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */
import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#212B36',
    colorText: '#D4313E',
    background: '#F9FAFC',
    tint: '#637381',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primaryBase: '#FF3B4A',
    disabled:'#919EAB',
    secondaryText: '#212C3D',
    black:'#000000',
    iconText:'#A0B1C0',
    // Wallet / Balance screen tokens
    walletCardBg: '#801E25',
    walletPillBg: '#67181F',
    walletTextLight: '#FFE2E5',
    walletAccentLight: '#FFD8DB',
    walletHeroText: '#FFF1F2',
    walletButtonBg: '#FFF7F8',
    walletButtonText: '#AA2731',
    walletButtonBgDisabled: '#EFD9DB',
    walletButtonTextDisabled: '#C18B92',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    pagebg:'rgba(17, 22, 31, 1)',
    // Wallet / Balance screen tokens (dark approximations)
    walletCardBg: '#5B1419',
    walletPillBg: '#4A0F14',
    walletTextLight: '#FFD6DB',
    walletAccentLight: '#FFC2C8',
    walletHeroText: '#FFE5E8',
    walletButtonBg: '#2A2A2A',
    walletButtonText: '#FFB1BA',
    walletButtonBgDisabled: '#3A3A3A',
    walletButtonTextDisabled: '#CFA0A6',
  },
};

export const primaryBase = '#FF3B4A';
export const primaryLight = '#FFD8DB';
export const secondary = '#071827';
export const secondaryBase = '#212C3D';

export const white = '#fff';
export const black = '#000';
export const lightGray = '#C2C2C2';
export const darkGray = '#464F54';
export const blurGray = '#EFF0F3';
export const red = '#F5000F';
export const darkRed = '#E42E44';


export const COLORS = {
  primaryYellow: 'rgba(251, 176, 60, 1)',
  primaryOrange: 'rgba(215, 27, 91, 1)',
  primaryButtonText: 'rgba(5, 5, 7, 1)',
  textDark: 'rgba(18, 18, 18, 1)',
  primaryBg: '#F9FAFC',
  dontHaveAccount: 'rgba(31, 31, 31, 1)',
  createOne: 'rgba(179, 179, 179, 1)',
  createOneYellow: 'rgba(209, 147, 50, 1)',
  lightCreateOne: 'rgba(102, 102, 102, 1)',
  success: 'rgba(36, 189, 134, 1)',
  black: '#000000',
  authLayoutSubtitle: 'rgba(77, 77, 77, 1)',
  backgroundColor: 'rgba(249, 249, 249, 1)',
  white: '#FFFFFF',
  filterBorderColor: 'rgba(186, 186, 186, 1)',
  filterModalColor: 'rgba(230, 230, 230, 1)',
  searchBackgroundColor: 'rgba(238, 239, 241, 1)',
  red: 'rgba(240, 44, 44, 1)',
  vendorCategory: 'rgba(128, 128, 128, 1)',
  borderColor: 'rgba(217, 217, 217, 1)',
  modalHandleColor: 'rgba(204, 204, 204, 1)',
  disabledButton: 'rgba(209, 209, 211, 1)',
  disabledButtonText: 'rgba(139, 140, 145, 1)',
  transparentPrimary: '#73e8ff',
  transparentPrimray: '#90e0ef',
  secondary: '#00b4d8',
  orange: '#FFA133',
  lightOrange: '#FFA133',
  lightOrange2: '#FDDED4',
  lightOrange3: '#FFD9AD',
  deepGreen: '#27AE60',
  green: '#60dc94',
  blue: '#0064C0',
  darkBlue: '#111A2C',
  darkGray: '#525C67',
  darkGray2: '#757D85',
  gray: '#898B9A',
  gray2: '#BBBDC1',
  gray3: '#CFD0D7',
  lightGray1: '#DDDDDD',
  lightGray2: '#F5F5F8',
  white2: '#FBFBFB',
  inputText: '#4F4F4F',
  ash: '#F2F2F2',
  deepAsh: '#C4C4C4',
  divider: '##E5E5E5',
  primary: '#04100F',


  transparent: 'transparent',
  transparentBlack1: 'rgba(0, 0, 0, 0.1)',
  transparentBlack7: 'rgba(0, 0, 0, 0.7)',
};

export const SIZES = {
  // global sizes
  base: 8,
  font: 14,
  radius: 12,
  radius2: 16,
  // padding: 24,
  // padding:30,
  padding:50,
  bodySmall: 20,

  // font sizes
  largeTitle: 40,
  h1: 30,
  h2: 22,
  h3: 16,
  h4: 14,
  h5: 12,
  body1: 28,
  body2: 24,
  body3: 20,
  body4: 18,
  body5: 10,

  // app dimensions
  width,
  height,
};
export const FONTS = {
  h2: {
    fontFamily: 'Karla-Medium',
    fontSize: SIZES.body5,
    color: COLORS.black,
  },
  h3: {
    fontFamily: 'Karla-SemiBold',
    fontSize: SIZES.h3,
    lineHeight: 22,
    color: COLORS.black,
  },
  h4: {
    fontFamily: 'Karla-SemiBold',
    fontSize: SIZES.body5,
    color: COLORS.black,
  },
  h5: {
    fontFamily: 'Karla-Light',
    fontSize: SIZES.base,
    color: COLORS.black,
  },
  h6: {
    fontFamily: 'Karla-Italic',
    fontSize: SIZES.base,
    color: COLORS.black,
  },
  likes: {
    fontFamily: 'Karla-Bold',
    fontSize: SIZES.base,
    marginHorizontal: SIZES.base,
    color: COLORS.black,
  },
  conatactName: {
    fontFamily: 'Karla-Bold',
    fontSize: SIZES.body5,
    marginHorizontal: SIZES.base,
    marginVertical: 2,
    color: COLORS.black,
  },
  contactOccupation: {
    fontFamily: 'Karla-SemiBold',
    fontSize: SIZES.base,
    marginHorizontal: SIZES.base,
    marginVertical: 1,
    color: COLORS.black,
  },
  contactPosition: {
    fontFamily: 'Karla-Light',
    fontSize: SIZES.base,
    marginHorizontal: SIZES.base,
    marginVertical: 1,
    color: COLORS.black,
  },
  add: {
    fontFamily: 'Karla-Bold',
    fontSize: SIZES.body5,
    marginHorizontal: SIZES.base,
    color: COLORS.black,
  },
  fontFamily: 'Karla-Regular',
  fontFamilyBlack: 'Karla-Bold',
  fontStyle: 'normal',
  fontStyleBold: 'bold',
};

const appTheme = {COLORS, SIZES, FONTS};

export default appTheme;
