"use client";

import { useSyncExternalStore } from "react";
import { CheckoutFormData, FormValidationErrors, CartItem, CartTotals } from "@/types/cart";
import { orderService, PlacedOrder } from "@/services/orderService";

interface CheckoutStoreState {
  formData: CheckoutFormData;
  errors: FormValidationErrors;
  isSubmitting: boolean;
  placedOrder: PlacedOrder | null;
}

const DEFAULT_FORM_DATA: CheckoutFormData = {
  mobileNumber: "9370102691",
  fullName: "Prerna Sharma",
  addressLine: "Flat 302, Royal Palms, Ramdaspeth",
  landmark: "Near Central Park Hospital",
  city: "Nagpur",
  state: "Maharashtra",
  pincode: "440010",
  addressType: "home",
  deliveryType: "standard",
  paymentMethod: "upi",
  whatsappUpdates: true,
};

let state: CheckoutStoreState = {
  formData: DEFAULT_FORM_DATA,
  errors: {},
  isSubmitting: false,
  placedOrder: null,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export const checkoutStore = {
  getSnapshot(): CheckoutStoreState {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  updateField<K extends keyof CheckoutFormData>(field: K, value: CheckoutFormData[K]): void {
    state = {
      ...state,
      formData: { ...state.formData, [field]: value },
      errors: { ...state.errors, [field]: undefined }, // clear field error on edit
    };
    emitChange();
  },

  setDeliveryType(type: "standard" | "express"): void {
    state = {
      ...state,
      formData: { ...state.formData, deliveryType: type },
    };
    emitChange();
  },

  setPaymentMethod(method: "upi" | "card" | "netbanking" | "cod"): void {
    state = {
      ...state,
      formData: { ...state.formData, paymentMethod: method },
      errors: { ...state.errors, paymentMethod: undefined },
    };
    emitChange();
  },

  validate(): boolean {
    const errors = orderService.validateCheckoutForm(state.formData);
    state = { ...state, errors };
    emitChange();
    return Object.keys(errors).length === 0;
  },

  async submitOrder(items: CartItem[], totals: CartTotals): Promise<{ success: boolean; order?: PlacedOrder; errors?: FormValidationErrors }> {
    const isValid = this.validate();
    if (!isValid) {
      return { success: false, errors: state.errors };
    }

    state = { ...state, isSubmitting: true };
    emitChange();

    try {
      const order = await orderService.placeOrder(state.formData, items, totals);
      state = {
        ...state,
        isSubmitting: false,
        placedOrder: order,
      };
      emitChange();
      return { success: true, order };
    } catch (err) {
      state = { ...state, isSubmitting: false };
      emitChange();
      return { success: false };
    }
  },

  reset(): void {
    state = {
      formData: DEFAULT_FORM_DATA,
      errors: {},
      isSubmitting: false,
      placedOrder: null,
    };
    emitChange();
  },
};

const SERVER_CHECKOUT_SNAPSHOT = {
  formData: DEFAULT_FORM_DATA,
  errors: {},
  isSubmitting: false,
  placedOrder: null,
};

const getCheckoutServerSnapshot = () => SERVER_CHECKOUT_SNAPSHOT;

export function useCheckoutStore() {
  const snapshot = useSyncExternalStore(
    checkoutStore.subscribe,
    checkoutStore.getSnapshot,
    getCheckoutServerSnapshot
  );

  return {
    ...snapshot,
    updateField: checkoutStore.updateField.bind(checkoutStore),
    setDeliveryType: checkoutStore.setDeliveryType.bind(checkoutStore),
    setPaymentMethod: checkoutStore.setPaymentMethod.bind(checkoutStore),
    validate: checkoutStore.validate.bind(checkoutStore),
    submitOrder: checkoutStore.submitOrder.bind(checkoutStore),
    reset: checkoutStore.reset.bind(checkoutStore),
  };
}
