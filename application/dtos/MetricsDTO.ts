// Interfaz base para todas las métricas con información de cache
export interface BaseMetricsDTO {
  fromCache: boolean
  cacheKey?: string
  cacheTTL?: number
  calculatedAt: string
}

export interface TableMetricsDTO extends BaseMetricsDTO {
  totalTables: number
  occupiedTables: number
  freeTables: number
  tables: Array<{
    id: string
    number: number
    status: 'free' | 'attended'
    currentOrder?: string
  }>
}

export interface RealTimeMetricsDTO extends BaseMetricsDTO {
  todaySales: number
  todayOrders: number
  topProducts: Array<{
    productId: string
    productName: string
    quantity: number
    totalSales: number
  }>
  occupiedTables: number
  activeWaiters: number
}

export interface SalesMetricsDTO extends BaseMetricsDTO {
  period: 'day' | 'week' | 'month'
  startDate: string
  endDate: string
  totalSales: number
  totalOrders: number
  totalTips: number
  averageOrderValue: number
  salesByDay?: Array<{
    date: string
    sales: number
    orders: number
  }>
}

export interface WaiterPerformanceDTO extends BaseMetricsDTO {
  waiterId: string
  waiterName: string
  totalOrders: number
  totalSales: number
  averageOrderValue: number
  ordersByDay?: Array<{
    date: string
    orders: number
    sales: number
  }>
}

export interface AllWaitersPerformanceDTO extends BaseMetricsDTO {
  startDate: string
  endDate: string
  totalWaiters: number
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  waiters: Array<{
    waiterId: string
    waiterName: string
    totalOrders: number
    totalSales: number
    averageOrderValue: number
    percentageOfTotalSales: number
    ordersByDay?: Array<{
      date: string
      orders: number
      sales: number
    }>
  }>
}

export interface ProductMetricsDTO extends BaseMetricsDTO {
  period: 'week' | 'month'
  startDate: string
  endDate: string
  topProducts: Array<{
    productId: string
    productName: string
    category: string
    quantity: number
    totalSales: number
    percentageOfTotal: number
  }>
  categoryBreakdown: Array<{
    category: string
    totalSales: number
    totalQuantity: number
    percentageOfTotal: number
  }>
}

export interface PeakHoursMetricsDTO extends BaseMetricsDTO {
  date: string
  hourlyActivity: Array<{
    hour: number
    orders: number
    sales: number
  }>
  peakHours: Array<{
    hour: number
    activity: 'low' | 'medium' | 'high'
  }>
}

export interface FinancialMetricsDTO extends BaseMetricsDTO {
  period: 'day' | 'week' | 'month'
  startDate: string
  endDate: string
  totalRevenue: number
  totalTips: number
  averageTipPercentage: number
  revenueByDay?: Array<{
    date: string
    revenue: number
    tips: number
  }>
}

export interface SalesReportDTO extends BaseMetricsDTO {
  startDate: string
  endDate: string
  totalSales: number
  totalOrders: number
  totalTips: number
  orders: Array<{
    id: string
    tableNumber: number
    waiterName: string
    total: number
    tip: number
    status: string
    createdAt: string
    products: Array<{
      name: string
      quantity: number
      price: number
      subtotal: number
    }>
  }>
}

export interface WaiterReportDTO extends BaseMetricsDTO {
  waiterId: string
  waiterName: string
  startDate: string
  endDate: string
  totalOrders: number
  totalSales: number
  totalTips: number
  averageOrderValue: number
  orders: Array<{
    id: string
    tableNumber: number
    total: number
    tip: number
    status: string
    createdAt: string
  }>
}

export interface ProductReportDTO extends BaseMetricsDTO {
  startDate: string
  endDate: string
  totalSales: number
  totalProducts: number
  categories: Array<{
    name: string
    totalSales: number
    totalQuantity: number
    products: Array<{
      id: string
      name: string
      quantity: number
      totalSales: number
      averagePrice: number
    }>
  }>
}

// Flujo de atención por franja horaria (7am - 7pm)
export interface HourlyFlowMetricsDTO extends BaseMetricsDTO {
  date: string
  startHour: number
  endHour: number
  hourlyFlow: Array<{
    hour: number
    hourLabel: string
    ordersCount: number
    customersServed: number
  }>
  totalOrdersInRange: number
  peakHour: number
  peakHourLabel: string
} 