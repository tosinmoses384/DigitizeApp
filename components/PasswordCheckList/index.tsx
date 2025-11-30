import { passwordCheckListValidator } from "@helper/password-validator";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import PasswordCheckLabel from "./PasswordCheckLabel";
import { useI18n } from "@hooks/use-i18n";

interface IPasswordCheckList {
  password?: any;
  validatePassword: any;
}

const PasswordCheckList = ({
  password,
  validatePassword,
}: IPasswordCheckList) => {
  const { t } = useI18n();
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialCharacter, setHasSpecialCharacter] = useState(false);
  const [hasLength, setHasLength] = useState(false);
  useEffect(() => {
    if (passwordCheckListValidator("UPPERCASE", password)) {
      setHasUppercase(true);
    } else {
      setHasUppercase(false);
    }

    if (passwordCheckListValidator("LOWERCASE", password)) {
      setHasLowercase(true);
    } else {
      setHasLowercase(false);
    }

    if (passwordCheckListValidator("NUMBER", password)) {
      setHasNumber(true);
    } else {
      setHasNumber(false);
    }

    if (passwordCheckListValidator("SPECIAL_CHARACTER", password)) {
      setHasSpecialCharacter(true);
    } else {
      setHasSpecialCharacter(false);
    }

    if (passwordCheckListValidator("LENGTH", password)) {
      setHasLength(true);
    } else {
      setHasLength(false);
    }
  }, [password]);

  useEffect(() => {
    if (
      hasSpecialCharacter &&
      hasUppercase &&
      hasLowercase &&
      hasLength &&
      hasNumber
    ) {
      validatePassword(true);
      return;
    }
    validatePassword(false);
  }, [
    //  password,
    hasSpecialCharacter,
    hasNumber,
    hasUppercase,
    hasLowercase,
    hasLength,
  ]);

  return (
    <View>
      <PasswordCheckLabel
        checked={hasLength}
        label={t('password.passwordMinLength')}
      />
      <PasswordCheckLabel
        checked={hasSpecialCharacter}
        label={t('password.passwordSpecialChar')}
      />
      <PasswordCheckLabel
        checked={hasNumber}
        label={t('password.passwordDigit')}
      />
      <PasswordCheckLabel
        checked={hasLowercase}
        label={t('password.passwordLowercase')}
      />
      <PasswordCheckLabel
        checked={hasUppercase}
        label={t('password.passwordUppercase')}
      />
    </View>
  );
};
export default PasswordCheckList;
