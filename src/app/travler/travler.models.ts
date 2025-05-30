export interface AddOn {
  uuid: string;
  enName: string;
  heName: string;
  esName: string;
  inStock: boolean;
}

export interface Item {
  uuid: string;
  enName: string;
  heName: string;
  esName: string;
  enDetails: string;
  heDetails: string;
  esDetails: string;
  imageUrl: string;
  price: number;
  availableAddOnUuids?: string[];
  addOnPrice?: number;
  freeAvailableAddOns?: number;
  kitchenOrders?: string;
  availability?: DaysInWeek;
}

export interface DaysInWeek {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface Category {
  uuid: string;
  type: string;
  enName: string;
  heName: string;
  esName: string;
  imageUrl: string;
  items: Item[];
}

export interface Order {
  uuid: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  printed: boolean;
  orderDate: string;
  items: OrderItem[];
}

export interface OrderItem {
  uuid: string;
  itemUuid: string;
  itemName: string;
  price: number;
  quantity: number;
  selectedAddOns: string[];
  itemTotalPrice: number;
}

export interface CustomerDetails {
  name?: string;
  phone?: string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  order: any;
}
