"use client";

import { useQuery } from "../useQuery";
import { useMutation } from "../useMutation";
import { ordersApi } from "@/api/orders";
import { PlacedOrder, TrackedOrder, OrderStatus } from "@/types/order";

/**
 * Query user's placed orders
 */
export function useUserOrdersQuery() {
  return useQuery<PlacedOrder[]>(
    ["user", "orders"],
    async () => {
      const res = await ordersApi.getUserOrders();
      return res.data;
    },
    { staleTime: 30000 }
  );
}

/**
 * Query live tracking details for an order
 */
export function useTrackOrderQuery(orderIdOrAwb: string) {
  return useQuery<TrackedOrder>(
    ["orders", "track", orderIdOrAwb],
    async () => {
      const res = await ordersApi.trackOrder(orderIdOrAwb);
      return res.data;
    },
    { enabled: Boolean(orderIdOrAwb), staleTime: 15000 }
  );
}

/**
 * Mutation hook to place an order
 */
export function useCreateOrderMutation() {
  return useMutation<PlacedOrder, unknown>(async (payload: unknown) => {
    const res = await ordersApi.createOrder(payload);
    return res.data;
  });
}

/**
 * Mutation hook to cancel an order
 */
export function useCancelOrderMutation() {
  return useMutation<{ id: string; status: OrderStatus }, { id: string; reason?: string }>(
    async ({ id, reason }) => {
      const res = await ordersApi.cancelOrder(id, reason);
      return res.data;
    }
  );
}
