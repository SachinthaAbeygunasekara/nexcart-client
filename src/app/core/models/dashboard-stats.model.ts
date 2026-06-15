export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number; // stored in smallest currency unit or whole number as backend returns
}

