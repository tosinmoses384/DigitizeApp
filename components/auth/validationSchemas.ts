import * as yup from "yup";

export const emailValidationSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
});

export const passwordValidationSchema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters long"),
});

export const signupValidationSchema = yup.object().shape({
  firstName: yup
    .string()
    .matches(
      /^[a-zA-Z0-9]+$/,
      "'First Name' can only contain letters or numbers."
    )
    .required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  country: yup.string().required("Country is required"),
  phone: yup
    .string()
    .matches(/^[0-9]+$/, "Phone number must contain only digits")
    .min(8, "Phone number must be at least 8 digits")
    .required("Phone number is required"),
});
