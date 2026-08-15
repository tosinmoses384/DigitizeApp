import { AnimationObject } from "lottie-react-native";

export interface OnboardingData {
  id: number;
  animation: AnimationObject;
  text: string;
  bodyText: string;
  textColor: string;
  backgroundColor: string;
}

const data: OnboardingData[] = [
  {
    id: 1,
    animation: require("../assets/images/o-slide1.png"),
    text: "Your Digital Wardrobe ",
    bodyText: "Upload your clothes to organise, plan and visualise your style.",
    textColor: "#000000",
    backgroundColor: "transparent",
  },
  {
    id: 2,
    animation: require("../assets/images/o-slide2.png"),
    text: "Outfit Styling",
    bodyText: "Mix, match and create outfits that show off your personal vibe.",
    textColor: "#000000",
    backgroundColor: "transparent",
  },
  {
    id: 3,
    animation: require("../assets/images/o-slide3.png"),
    text: "Plan Ahead",
    bodyText:
      "Schedule looks by date, event or mood—always dress with intention.",
    textColor: "#000000",
    backgroundColor: "transparent",
  },
  {
    id: 4,
    animation: require("../assets/images/o-slide4.png"),
    text: "Preloved Market",
    bodyText:
      "Let go of pieces you’ve outgrown or shop for gems to complete your wardrobe.",
    textColor: "#000000",
    backgroundColor: "transparent",
  },
  {
    id: 5,
    animation: require("../assets/images/o-slide5.png"),
    text: "Style Inspiration",
    bodyText: "Discover looks and ideas from our global DigitizeApp community.",
    textColor: "#000000",
    backgroundColor: "transparent",
  },
];

export default data;
