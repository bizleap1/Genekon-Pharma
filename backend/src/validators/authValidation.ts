import { z } from "zod";

export const sendOtpSchema = z
  .object({
    identifier: z.string().optional(),
    phone: z.string().optional(),
  })
  .refine(
    (data) => {
      const val = (data.identifier || data.phone || "").trim();
      const isPhone = /^[6-9]\d{9}$/.test(val.replace(/\D/g, "").slice(-10));
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      return isPhone || isEmail;
    },
    { message: "Please provide a valid 10-digit Indian mobile number or valid email address" }
  );

export const verifyOtpSchema = z
  .object({
    identifier: z.string().optional(),
    phone: z.string().optional(),
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only numbers"),
    role: z.enum(["CUSTOMER", "WHOLESALE_PARTNER"]).optional().default("CUSTOMER"),
  })
  .refine((data) => Boolean((data.identifier || data.phone)?.trim()), {
    message: "Identifier or phone number is required",
  });

export const registerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(["CUSTOMER", "WHOLESALE_PARTNER", "ADMIN"]).optional().default("CUSTOMER"),
  profileDetails: z
    .object({
      avatar: z.string().optional(),
      dateOfBirth: z.string().optional(),
      gender: z.string().optional(),
      businessName: z.string().optional(),
      gstNumber: z.string().optional(),
    })
    .optional(),
});

export const loginPasswordSchema = z.object({
  identifier: z.string().min(1, "Mobile or email is required"),
  password: z.string().min(1, "Password is required"),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, "Google ID Token is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid 10-digit mobile").optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  avatar: z.string().optional(),
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
});

export const addressSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit phone is required"),
    addressLine: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
    addressType: z.enum(["HOME", "WORK", "CLINIC", "OTHER"]).default("HOME"),
    isDefault: z.boolean().optional().default(false),
  })
  .transform((data) => {
    const primary = (data.addressLine || data.addressLine1 || "").trim();
    const secondary = data.addressLine2 ? `, ${data.addressLine2.trim()}` : "";
    return {
      fullName: data.fullName,
      phone: data.phone,
      addressLine: `${primary}${secondary}`.trim(),
      landmark: data.landmark,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      addressType: data.addressType,
      isDefault: data.isDefault,
    };
  })
  .refine((data) => data.addressLine.length >= 5, {
    message: "Address line must be at least 5 characters",
    path: ["addressLine"],
  });
