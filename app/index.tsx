import { Redirect } from "expo-router";
import React from "react";

export default function Page() {
  // Redirect to SplashScreen route instead of importing directly
  // This ensures proper Redux Provider context
  return <Redirect href="/SplashScreen" />;
}
