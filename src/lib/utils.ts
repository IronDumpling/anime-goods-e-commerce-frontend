import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Order } from '@/lib/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function addOrderTotal(order: Order): Order & { total: number } {
  return {
    ...order,
    total: order.orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    ),
  };
}
