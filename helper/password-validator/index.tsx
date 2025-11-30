export const passwordCheckListValidator = (key: any, password: any) => {
  let regularExpression;
  switch (key) {
    case "UPPERCASE":
      regularExpression = /(?=.*[A-Z])/;
      return regularExpression?.test(password);
    case "LOWERCASE":
      regularExpression = /(?=.*[a-z])/;
      return regularExpression?.test(password);
    case "NUMBER":
      regularExpression = /(?=.*[0-9])/;
      return regularExpression?.test(password);
    case "SPECIAL_CHARACTER":
      regularExpression = /(?=.*[!@#$%^&*])/;
      return regularExpression?.test(password);
    case "LENGTH":
      regularExpression = /(?=.{6,})/;
      return regularExpression?.test(password);
  }
};
