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
  addOns?: string[];
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
