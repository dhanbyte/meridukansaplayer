import { Order, OrderItem } from './orderTypes';

const ORDERS_KEY = 'shopwave_orders';

export class OrderService {
  static getOrders(): Order[] {
    if (typeof window === 'undefined') return [];
    const orders = localStorage.getItem(ORDERS_KEY);
    return orders ? JSON.parse(orders) : [];
  }

  static saveOrders(orders: Order[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }

  static async createOrder(userId: string, userName: string, userPhone: string, items: OrderItem[]): Promise<Order> {
    const orders = this.getOrders();
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const newOrder: Order = {
      id: `order_${Date.now()}`,
      userId,
      userName,
      userPhone,
      items,
      totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    this.saveOrders(orders);
    return newOrder;
  }

  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return false;
    
    orders[index].status = status;
    orders[index].updatedAt = new Date().toISOString();
    this.saveOrders(orders);
    return true;
  }

  static getUserOrders(userId: string): Order[] {
    const orders = this.getOrders();
    return orders.filter(o => o.userId === userId);
  }
}