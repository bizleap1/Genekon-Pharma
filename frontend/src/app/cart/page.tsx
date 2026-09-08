"use client";

import React from "react";
import CartView from "@/components/cart/CartView";
import { ClientOnly } from "@/components/ui/ClientOnly";

export default function CartPage() {
  return (
    <ClientOnly>
      <CartView />
    </ClientOnly>
  );
}
