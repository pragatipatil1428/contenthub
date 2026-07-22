export type {
  ContentType,
  ContentStatus,
  PriceType,
  PaymentMethod,
  PaymentStatus,
  NotificationType,
} from "@/app/generated/prisma";

export interface DashboardStats {
  totalUsers: number;
  totalRevenue: number;
  todayRevenue: number;
  totalPurchases: number;
  pendingPurchases: number;
  failedPurchases: number;
  freeDownloads: number;
  paidDownloads: number;
  totalContent: number;
}

export interface ChartData {
  month: string;
  value: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface PurchaseData {
  month: string;
  purchases: number;
}

export interface CategoryData {
  name: string;
  count: number;
}

export interface SearchParams {
  q?: string;
  category?: string;
  type?: string;
  priceType?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationInfo;
}
