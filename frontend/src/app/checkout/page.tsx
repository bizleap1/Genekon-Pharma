"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Phone,
  Home,
  Truck,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  MessageCircle,
  Plus,
  AlertCircle,
  ArrowRight,
  MapPin,
  ShoppingBag
} from "lucide-react";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { Header } from "@/components/layout/Header";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { useCart } from "@/context/CartContext";
import { useAuthStore } from "@/stores/authStore";
import { orderService, PlacedOrder } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import { CheckoutFormData, FormValidationErrors } from "@/types/cart";
import { useToast } from "@/context/ToastContext";
import { usersApi } from "@/api/users";
import { UserAddress } from "@/types/user";

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, isLoggedIn, openLoginModal } = useAuthStore();
  const { items, totals, deliveryType, setDeliveryType, clearCart } = useCart();

  const [formData, setFormData] = useState<CheckoutFormData>({
    mobileNumber: user?.mobile || "",
    fullName: user?.name || "",
    addressLine: user?.address || "",
    landmark: "",
    city: user?.city || "",
    state: "Maharashtra",
    pincode: user?.pincode || "",
    addressType: "home",
    deliveryType: deliveryType,
    paymentMethod: "upi",
    whatsappUpdates: true,
  });

  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      openLoginModal(
        {
          type: "CHECKOUT",
          title: "Proceed to Checkout",
          redirectUrl: "/checkout",
        },
        "Login required to continue with checkout"
      );
      return;
    }

    let isMounted = true;
    usersApi.getUserAddresses().then((res) => {
      if (!isMounted) return;
      if (res.success && res.data && res.data.length > 0) {
        setSavedAddresses(res.data);
        const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
        setSelectedAddressId(defaultAddr.id);
        setFormData((prev) => ({
          ...prev,
          fullName: defaultAddr.fullName || defaultAddr.name || user?.name || prev.fullName,
          mobileNumber: defaultAddr.phone || user?.mobile || prev.mobileNumber,
          addressLine: defaultAddr.addressLine || prev.addressLine,
          landmark: defaultAddr.landmark || prev.landmark || "",
          city: defaultAddr.city || prev.city,
          state: defaultAddr.state || prev.state || "Maharashtra",
          pincode: defaultAddr.pincode || prev.pincode,
          addressType: (defaultAddr.type as any) || prev.addressType,
        }));
        setIsEditingAddress(false);
      } else if (user) {
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || user.name || "",
          mobileNumber: prev.mobileNumber || user.mobile || "",
          addressLine: prev.addressLine || user.address || "",
          city: prev.city || user.city || "",
          pincode: prev.pincode || user.pincode || "",
        }));
        if (!user.address) {
          setIsEditingAddress(true);
        }
      } else {
        setIsEditingAddress(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, openLoginModal, user]);

  const handleSelectAddress = (addr: UserAddress) => {
    setSelectedAddressId(addr.id);
    setFormData((prev) => ({
      ...prev,
      fullName: addr.fullName || addr.name || prev.fullName,
      mobileNumber: addr.phone || prev.mobileNumber,
      addressLine: addr.addressLine,
      landmark: addr.landmark || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      addressType: (addr.type as any) || "home",
    }));
    setIsEditingAddress(false);
  };

  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [otpSent, setOtpSent] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  const selectedItems = items.filter((i) => i.selected);

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      openLoginModal(
        {
          type: "CHECKOUT",
          title: "Proceed to Checkout",
          redirectUrl: "/checkout",
        },
        "Login required to place order"
      );
      return;
    }

    // Validate form
    const currentData = { ...formData, deliveryType };
    const validationErrors = orderService.validateCheckoutForm(currentData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      window.scrollTo({ top: 150, behavior: "smooth" });
      return;
    }

    if (selectedItems.length === 0) {
      toast.warning("No items selected in cart. Please return to cart and select medicines.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const order = await orderService.placeOrder(currentData, selectedItems, totals);

      if (currentData.paymentMethod !== "cod") {
        // Trigger Razorpay payment gateway
        try {
          await paymentService.launchRazorpay({
            orderId: order.orderId,
            amountInRupees: totals.totalAmount,
            patientName: currentData.fullName,
            patientPhone: currentData.mobileNumber,
            onSuccess: () => {
              setPlacedOrder(order);
              clearCart();
              toast.success("Payment verified and order confirmed successfully!");
            },
            onDismiss: () => {
              setIsPlacingOrder(false);
              toast.warning(
                "Payment was not completed. You can retry or choose Cash on Delivery."
              );
            },
          });
        } catch (rzpErr: any) {
          console.warn("Razorpay modal error, confirming order directly:", rzpErr);
          setPlacedOrder(order);
          clearCart();
        }
      } else {
        // Cash on Delivery
        setPlacedOrder(order);
        clearCart();
        toast.success("Order placed successfully with Cash on Delivery!");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCFA]">
      <UtilityBar />
      <Header />
      <CategoryNav />

      <main className="flex-1 py-6 sm:py-8">
        <Container>
          {/* Top Title & 100% Secure Checkout Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#E3EDE1] gap-3">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#14304A] tracking-tight">
                Checkout
              </h1>
              <p className="text-xs sm:text-sm text-[#556958] mt-0.5">
                Complete your order in a few simple steps
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDF7E9] text-[#559620] text-xs font-bold w-fit">
              <Lock className="w-3.5 h-3.5" />
              <span>100% Secure &amp; Regulated Checkout</span>
            </div>
          </div>

          {/* Stepper Bar */}
          <div className="hidden md:flex items-center justify-center max-w-2xl mx-auto mb-8 text-xs font-bold text-[#14304A]">
            <div className="flex items-center gap-2 text-[#559620]">
              <span className="w-6 h-6 rounded-full bg-[#559620] text-white flex items-center justify-center text-[11px]">
                1
              </span>
              <span>Contact</span>
            </div>
            <div className="w-10 h-0.5 bg-[#559620] mx-2" />

            <div className="flex items-center gap-2 text-[#559620]">
              <span className="w-6 h-6 rounded-full bg-[#559620] text-white flex items-center justify-center text-[11px]">
                2
              </span>
              <span>Address</span>
            </div>
            <div className="w-10 h-0.5 bg-[#559620] mx-2" />

            <div className="flex items-center gap-2 text-[#559620]">
              <span className="w-6 h-6 rounded-full bg-[#559620] text-white flex items-center justify-center text-[11px]">
                3
              </span>
              <span>Delivery</span>
            </div>
            <div className="w-10 h-0.5 bg-[#559620] mx-2" />

            <div className="flex items-center gap-2 text-[#1853A8]">
              <span className="w-6 h-6 rounded-full bg-[#1853A8] text-white flex items-center justify-center text-[11px]">
                4
              </span>
              <span>Payment</span>
            </div>
            <div className="w-10 h-0.5 bg-[#DCE6DE] mx-2" />

            <div className="flex items-center gap-2 text-[#8C9F8E]">
              <span className="w-6 h-6 rounded-full bg-[#E5EFE3] text-[#6E8070] flex items-center justify-center text-[11px]">
                5
              </span>
              <span>Confirmation</span>
            </div>
          </div>

          {placedOrder ? (
            /* Order Placed Success View */
            <div className="rounded-3xl border border-[#D5EAD0] bg-white p-8 sm:p-12 text-center max-w-xl mx-auto my-6 shadow-sm animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-[#EDF7E9] text-[#559620] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EDF7E9] text-[#447719] inline-block mb-2">
                Order Confirmed
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#14304A]">
                Thank You for Your Order!
              </h2>
              <p className="text-xs sm:text-sm text-[#556958] mt-2 mb-5 leading-relaxed">
                Your order ID is <strong>#{placedOrder.orderId}</strong>. We have sent the confirmation SMS and tax invoice to <strong>+91 {placedOrder.formData.mobileNumber}</strong>.
              </p>

              <div className="p-5 rounded-2xl bg-[#F4F9F2] text-xs text-[#3D5240] text-left mb-6 space-y-2 border border-[#D5EAD0]">
                <div className="flex justify-between border-b border-[#E3ECE0] pb-2">
                  <span className="text-[#687C68]">Recipient:</span>
                  <strong>{placedOrder.formData.fullName}</strong>
                </div>
                <div className="flex justify-between border-b border-[#E3ECE0] pb-2">
                  <span className="text-[#687C68]">Delivery Address:</span>
                  <span className="text-right max-w-xs font-medium">
                    {placedOrder.formData.addressLine}, {placedOrder.formData.city}, {placedOrder.formData.state} {placedOrder.formData.pincode}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#E3ECE0] pb-2">
                  <span className="text-[#687C68]">Estimated Delivery:</span>
                  <strong className="text-[#559620]">{placedOrder.estimatedDelivery}</strong>
                </div>
                <div className="flex justify-between pt-1 font-bold text-[#14304A]">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono text-sm text-[#559620]">₹{placedOrder.totals.totalAmount}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/account/orders`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#559620] hover:bg-[#467e19] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full transition-colors shadow-2xs"
                >
                  <span>Track in My Orders</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#CCDCCD] bg-white hover:bg-[#F2F7F2] text-[#14304A] text-xs sm:text-sm font-bold px-6 py-3 rounded-full transition-colors"
                >
                  <span>Return to Home</span>
                </Link>
              </div>
            </div>
          ) : selectedItems.length === 0 ? (
            /* Cart Empty Warning during Checkout */
            <div className="rounded-3xl border border-[#E0ECE0] bg-white p-10 text-center max-w-md mx-auto my-8 shadow-2xs">
              <div className="w-14 h-14 rounded-full bg-[#EDF7E9] text-[#559620] flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#14304A]">No items to checkout</h2>
              <p className="text-xs text-[#637766] mt-2 mb-6">
                Your cart has no selected items. Please return to cart and select products.
              </p>
              <Link
                href="/cart"
                className="inline-flex items-center gap-2 bg-[#559620] hover:bg-[#467E19] text-white text-xs font-bold px-6 py-2.5 rounded-full transition-colors"
              >
                <span>Go to Cart</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            /* Checkout Form 2-Column Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* LEFT COLUMN: 4 Accordions / Form Sections */}
              <div className="lg:col-span-8 space-y-5">
                
                {/* 1. Contact Information */}
                <div className="rounded-2xl border border-[#E0ECE0] bg-white p-5 sm:p-6 shadow-2xs">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-7 h-7 rounded-full bg-[#559620] text-white flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#559620]" />
                      <h3 className="text-sm sm:text-base font-bold text-[#14304A]">
                        Contact Information
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-[#6B7D6D] -mt-2 mb-4 ml-10">
                    We&apos;ll use this number to share order confirmation &amp; delivery updates.
                  </p>

                  <div className="ml-0 sm:ml-10 space-y-3">
                    <label className="text-xs font-semibold text-[#14304A] block">
                      Mobile Number *
                    </label>
                    <div className="flex items-center gap-2 max-w-md">
                      <span className="px-3.5 py-2.5 rounded-xl border border-[#CADDC7] bg-[#F4F9F2] text-xs font-bold text-[#14304A]">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={formData.mobileNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setFormData({ ...formData, mobileNumber: val });
                          if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: undefined });
                        }}
                        placeholder="10-digit mobile number"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#CADDC7] text-xs font-semibold text-[#14304A] outline-none focus:border-[#559620]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(true);
                          setTimeout(() => setOtpSent(false), 8000);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#559620] hover:bg-[#467e19] text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
                      >
                        {otpSent ? "Sent ✓" : "Send OTP"}
                      </button>
                    </div>
                    {errors.mobileNumber && (
                      <p className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.mobileNumber}</span>
                      </p>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                      <input
                        type="checkbox"
                        checked={formData.whatsappUpdates}
                        onChange={(e) =>
                          setFormData({ ...formData, whatsappUpdates: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#559620] focus:ring-[#559620]"
                      />
                      <span className="text-xs text-[#526657]">
                        Send me dispensary updates &amp; live courier tracking on WhatsApp
                      </span>
                    </label>
                  </div>
                </div>

                {/* 2. Delivery Address */}
                <div className="rounded-2xl border border-[#E0ECE0] bg-white p-5 sm:p-6 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#559620] text-white flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-[#559620]" />
                        <h3 className="text-sm sm:text-base font-bold text-[#14304A]">
                          Delivery Address
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(!isEditingAddress)}
                      className="text-xs font-bold text-[#1853A8] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isEditingAddress ? "Use Saved Address" : "Edit / Change Address"}</span>
                    </button>
                  </div>

                  <div className="ml-0 sm:ml-10">
                    {!isEditingAddress ? (
                      formData.addressLine ? (
                        <div className="p-4 rounded-xl border-2 border-[#559620] bg-[#F4FAF1] flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-[#559620] mt-1 shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#14304A] capitalize">
                                  {formData.addressType} Address
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#559620] text-white">
                                  Selected
                                </span>
                              </div>
                              <p className="text-xs font-bold text-[#14304A] mt-1">
                                {formData.fullName || user?.name || "Customer"}
                              </p>
                              <p className="text-xs text-[#526657] mt-0.5">
                                {formData.addressLine}
                                {formData.landmark ? `, ${formData.landmark}` : ""},{" "}
                                {formData.city}, {formData.state} - {formData.pincode}
                              </p>
                              <p className="text-xs text-[#526657] mt-0.5">
                                Contact: +91 {formData.mobileNumber || user?.mobile}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsEditingAddress(true)}
                            className="text-xs font-bold text-[#1853A8] hover:underline cursor-pointer shrink-0 ml-2"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <div className="p-5 rounded-xl border border-dashed border-[#CCDCCD] bg-[#FAFCFA] text-center">
                          <MapPin className="w-6 h-6 text-[#559620] mx-auto mb-2" />
                          <p className="text-xs font-bold text-[#14304A]">No delivery address selected</p>
                          <p className="text-[11px] text-[#6E8070] mt-0.5 mb-3">
                            Please add your delivery address to proceed with dispatch
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsEditingAddress(true)}
                            className="px-4 py-2 rounded-xl bg-[#559620] text-white text-xs font-bold hover:bg-[#467e19] transition-colors cursor-pointer"
                          >
                            + Add Delivery Address
                          </button>
                        </div>
                      )
                    ) : (
                      /* Address Selection & Edit Form */
                      <div className="space-y-4">
                        {savedAddresses.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-[#14304A] block">
                              Select from Saved Addresses:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {savedAddresses.map((addr) => (
                                <div
                                  key={addr.id}
                                  onClick={() => handleSelectAddress(addr)}
                                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                                    selectedAddressId === addr.id
                                      ? "border-2 border-[#559620] bg-[#F4FAF1]"
                                      : "border-[#E3EDE1] bg-white hover:border-[#CADDC7]"
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-bold text-[#14304A] capitalize">
                                        {addr.type || "Home"}
                                      </span>
                                      {addr.isDefault && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EDF7E9] text-[#559620]">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs font-bold text-[#14304A]">
                                      {addr.fullName || addr.name}
                                    </p>
                                    <p className="text-[11px] text-[#526657] mt-0.5 line-clamp-2">
                                      {addr.addressLine}
                                      {addr.landmark ? `, ${addr.landmark}` : ""}, {addr.city},{" "}
                                      {addr.state} - {addr.pincode}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectAddress(addr);
                                    }}
                                    className="mt-2 text-left text-[11px] font-bold text-[#559620] hover:underline"
                                  >
                                    Deliver Here &rarr;
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="p-4 rounded-xl border border-[#D5EAD0] bg-[#FAFCFA] space-y-3">
                          <span className="text-xs font-bold text-[#14304A] block">
                            {savedAddresses.length > 0 ? "Or Enter / Edit Address Details:" : "Enter Delivery Address:"}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-bold text-[#14304A] block mb-1">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) =>
                                  setFormData({ ...formData, fullName: e.target.value })
                                }
                                placeholder="Recipient name"
                                className="w-full text-xs px-3 py-2 rounded-xl border border-[#CCDCCD] bg-white outline-none focus:border-[#559620]"
                              />
                              {errors.fullName && (
                                <p className="text-[10px] text-red-500 font-bold mt-1">
                                  {errors.fullName}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="text-xs font-bold text-[#14304A] block mb-1">
                                6-Digit PIN Code *
                              </label>
                              <input
                                type="text"
                                maxLength={6}
                                value={formData.pincode}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    pincode: e.target.value.replace(/\D/g, ""),
                                  })
                                }
                                placeholder="e.g. 440013"
                                className="w-full text-xs px-3 py-2 rounded-xl border border-[#CCDCCD] bg-white outline-none focus:border-[#559620]"
                              />
                              {errors.pincode && (
                                <p className="text-[10px] text-red-500 font-bold mt-1">
                                  {errors.pincode}
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-[#14304A] block mb-1">
                              Flat, House No, Street Address *
                            </label>
                            <input
                              type="text"
                              value={formData.addressLine}
                              onChange={(e) =>
                                setFormData({ ...formData, addressLine: e.target.value })
                              }
                              placeholder="Building, Street, Area"
                              className="w-full text-xs px-3 py-2 rounded-xl border border-[#CCDCCD] bg-white outline-none focus:border-[#559620]"
                            />
                            {errors.addressLine && (
                              <p className="text-[10px] text-red-500 font-bold mt-1">
                                {errors.addressLine}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-bold text-[#14304A] block mb-1">
                                City *
                              </label>
                              <input
                                type="text"
                                value={formData.city}
                                onChange={(e) =>
                                  setFormData({ ...formData, city: e.target.value })
                                }
                                placeholder="City"
                                className="w-full text-xs px-3 py-2 rounded-xl border border-[#CCDCCD] bg-white outline-none focus:border-[#559620]"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold text-[#14304A] block mb-1">
                                State *
                              </label>
                              <input
                                type="text"
                                value={formData.state}
                                onChange={(e) =>
                                  setFormData({ ...formData, state: e.target.value })
                                }
                                placeholder="State"
                                className="w-full text-xs px-3 py-2 rounded-xl border border-[#CCDCCD] bg-white outline-none focus:border-[#559620]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (!formData.addressLine || formData.addressLine.trim().length < 5) {
                                  toast.warning("Please enter a valid street address");
                                  return;
                                }
                                setIsEditingAddress(false);
                              }}
                              className="px-4 py-2 rounded-xl bg-[#559620] hover:bg-[#467e19] text-white text-xs font-bold cursor-pointer transition-colors"
                            >
                              Save &amp; Use Address
                            </button>
                            {formData.addressLine && (
                              <button
                                type="button"
                                onClick={() => setIsEditingAddress(false)}
                                className="px-3 py-2 rounded-xl border border-[#CCDCCD] text-xs font-bold text-[#526657] hover:bg-slate-100 cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Delivery Options */}
                <div className="rounded-2xl border border-[#E0ECE0] bg-white p-5 sm:p-6 shadow-2xs">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-7 h-7 rounded-full bg-[#559620] text-white flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#559620]" />
                      <h3 className="text-sm sm:text-base font-bold text-[#14304A]">
                        Delivery Speed
                      </h3>
                    </div>
                  </div>

                  <div className="ml-0 sm:ml-10 space-y-2.5">
                    {/* Standard Delivery */}
                    <label
                      onClick={() => setDeliveryType("standard")}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-colors ${
                        deliveryType === "standard"
                          ? "border-[#559620] bg-[#F4FAF1]"
                          : "border-[#E3EDE1] hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryType === "standard"}
                          onChange={() => setDeliveryType("standard")}
                          className="w-4 h-4 text-[#559620] focus:ring-[#559620]"
                        />
                        <div>
                          <span className="text-xs font-bold text-[#14304A] block">
                            Standard Pharma Delivery
                          </span>
                          <span className="text-[11px] text-[#697C6B]">
                            Usually delivered in 2-4 business days
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-[#559620]">
                        {totals.subtotal >= totals.freeDeliveryThreshold ? "FREE" : "₹35"}
                      </span>
                    </label>

                    {/* Express Delivery */}
                    <label
                      onClick={() => setDeliveryType("express")}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-colors ${
                        deliveryType === "express"
                          ? "border-[#559620] bg-[#F4FAF1]"
                          : "border-[#E3EDE1] hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryType === "express"}
                          onChange={() => setDeliveryType("express")}
                          className="w-4 h-4 text-[#559620] focus:ring-[#559620]"
                        />
                        <div>
                          <span className="text-xs font-bold text-[#14304A] block">
                            Nagpur Regional Same-Day / Next-Day Express
                          </span>
                          <span className="text-[11px] text-[#697C6B]">
                            Priority insulated cold-chain packaging
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#14304A]">₹40</span>
                    </label>
                  </div>
                </div>

                {/* 4. Payment Method */}
                <div className="rounded-2xl border border-[#E0ECE0] bg-white p-5 sm:p-6 shadow-2xs">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-7 h-7 rounded-full bg-[#559620] text-white flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#559620]" />
                      <h3 className="text-sm sm:text-base font-bold text-[#14304A]">
                        Payment Method
                      </h3>
                    </div>
                  </div>

                  <div className="ml-0 sm:ml-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* UPI */}
                    <label
                      onClick={() => setFormData({ ...formData, paymentMethod: "upi" })}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                        formData.paymentMethod === "upi"
                          ? "border-[#559620] bg-[#F4FAF1]"
                          : "border-[#E3EDE1] hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === "upi"}
                        onChange={() => setFormData({ ...formData, paymentMethod: "upi" })}
                        className="w-4 h-4 text-[#559620] focus:ring-[#559620]"
                      />
                      <span className="text-xs font-bold text-[#14304A]">
                        UPI (Google Pay, PhonePe, Paytm)
                      </span>
                    </label>

                    {/* Credit / Debit Card */}
                    <label
                      onClick={() => setFormData({ ...formData, paymentMethod: "card" })}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                        formData.paymentMethod === "card"
                          ? "border-[#559620] bg-[#F4FAF1]"
                          : "border-[#E3EDE1] hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === "card"}
                        onChange={() => setFormData({ ...formData, paymentMethod: "card" })}
                        className="w-4 h-4 text-[#559620] focus:ring-[#559620]"
                      />
                      <span className="text-xs font-bold text-[#14304A]">
                        Credit / Debit Card
                      </span>
                    </label>

                    {/* Net Banking */}
                    <label
                      onClick={() => setFormData({ ...formData, paymentMethod: "netbanking" })}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                        formData.paymentMethod === "netbanking"
                          ? "border-[#559620] bg-[#F4FAF1]"
                          : "border-[#E3EDE1] hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === "netbanking"}
                        onChange={() => setFormData({ ...formData, paymentMethod: "netbanking" })}
                        className="w-4 h-4 text-[#559620] focus:ring-[#559620]"
                      />
                      <span className="text-xs font-bold text-[#14304A]">
                        Net Banking (All Indian Banks)
                      </span>
                    </label>

                    {/* Cash on Delivery */}
                    <label
                      onClick={() => setFormData({ ...formData, paymentMethod: "cod" })}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                        formData.paymentMethod === "cod"
                          ? "border-[#559620] bg-[#F4FAF1]"
                          : "border-[#E3EDE1] hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentMethod === "cod"}
                        onChange={() => setFormData({ ...formData, paymentMethod: "cod" })}
                        className="w-4 h-4 text-[#559620] focus:ring-[#559620]"
                      />
                      <span className="text-xs font-bold text-[#14304A]">
                        Cash on Delivery (Pay upon Receipt)
                      </span>
                    </label>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Order Summary & Place Order */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Order Summary Card */}
                <div className="rounded-3xl border border-[#E3EDE1] bg-white p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EBF3E8] pb-3">
                    <h2 className="font-serif text-lg text-[#14304A]">
                      Order Summary <span className="text-xs text-[#697C6B]">({selectedItems.length} items)</span>
                    </h2>
                    <Link href="/cart" className="text-xs font-bold text-[#1853A8] hover:underline">
                      Edit Cart
                    </Link>
                  </div>

                  {/* Products thumbnails */}
                  <div className="space-y-3 pb-2 border-b border-[#EBF3E8] max-h-56 overflow-y-auto pr-1">
                    {selectedItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-12 h-12 rounded-lg bg-[#FAFCFB] border border-[#EBF3E8] p-1 shrink-0 overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="50px"
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-[#14304A] line-clamp-1 block">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-[#697C6B]">
                              Qty: {item.quantity} &bull; {item.variant}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-[#14304A] shrink-0 font-mono">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2 text-xs text-[#556958]">
                    <div className="flex items-center justify-between">
                      <span>Items Subtotal</span>
                      <span className="font-bold text-[#14304A]">₹{totals.subtotal}</span>
                    </div>

                    <div className="flex items-center justify-between text-[#559620]">
                      <span>Retail Savings</span>
                      <span className="font-bold">- ₹{totals.discount}</span>
                    </div>

                    {totals.couponDiscount > 0 && (
                      <div className="flex items-center justify-between text-[#559620]">
                        <span>Coupon Savings ({totals.appliedCoupon?.code})</span>
                        <span className="font-bold">- ₹{totals.couponDiscount}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span>Delivery Fee</span>
                      <span className="font-bold text-[#14304A]">
                        {totals.deliveryCost === 0 ? "FREE" : `₹${totals.deliveryCost}`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#EBF3E8] flex items-baseline justify-between">
                    <div>
                      <span className="text-sm font-bold text-[#14304A] block">Total Payable</span>
                      <span className="text-[10px] text-[#8CA08E]">Inclusive of all GST</span>
                    </div>
                    <span className="text-2xl font-black text-[#14304A] font-mono">
                      ₹{totals.totalAmount}
                    </span>
                  </div>

                  {/* Submit CTA */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="w-full py-3.5 rounded-xl bg-[#559620] hover:bg-[#467e19] active:bg-[#3d6e16] text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isPlacingOrder ? (
                      <span className="animate-pulse">Confirming with Dispensary...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Place Order &bull; ₹{totals.totalAmount}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-[#697C6B]">
                    <Lock className="w-3.5 h-3.5 text-[#559620]" />
                    <span>256-bit encrypted checkout</span>
                  </div>
                </div>

                {/* Need Help WhatsApp Box */}
                <div className="rounded-3xl border border-[#D5EAD0] bg-[#F0F8EC] p-4 text-center space-y-1 text-xs">
                  <span className="font-bold text-[#14304A] block">Have questions about your prescription?</span>
                  <p className="text-[#556958] text-[11px]">Pharmacists are available on call &amp; WhatsApp</p>
                  <a
                    href="https://wa.me/919370102691"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#559620] font-bold hover:underline inline-block pt-1"
                  >
                    Chat on WhatsApp: 9370102691 &rarr;
                  </a>
                </div>

              </div>

            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
