export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Company {
  _id: string;
  tradeName: string;
  legalName: string;
  cnpj: string;
  userId: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  company: string;
  userId: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  userId: string;
}

export interface Order {
  _id: string;
  number: string;
  customer: {
    _id: string;
    name: string;
  };
  company: {
    _id: string;
    tradeName: string;
  };
  observation: string;
  date: string;
  status: string;
  total: number;
  userId: string;
}

export interface OrderItem {
  _id: string;
  product: Product;
  quantity: number;
}