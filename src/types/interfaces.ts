export interface RegisterProps {
  userType: "INDIVIDUAL" | "COMPANY";
  companyName: string;
  companyCac: string;
  firstName: string;
  lastName: string;
  dob: string;
  phoneNumber: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
  bvn: string;
  pin: string;
  cacVerified: boolean;
  storePersonalData: boolean;
  recieveCommunications: boolean;
}

export interface CardProps {
  id: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  maskedPan: string;
  currency: string;
  cardColor: string;
  textColor: string;
  bglogoColor: string;
  logoColor: string;
  name: string;
}

export interface Pagination {
  total: number;
  pages: number;
  page: string;
  limit: string;
}

export interface PaginatedResponse {
  code: number;
  pagination: Pagination;
}

export interface TransactionProps {
  amount: number;
  narration: string;
  provider: string;
  providerChannel: string;
  transactionDate: string;
  type: string;
  currency: string;
}
export interface CardTransactionProps {
  id: string;
  amount: number;
  merchantName: string;
  merchantId: string;
  merchantCountry: string;
  fee: number;
  vat: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  cardId: string;
  accountId: string;
  customerId: string;
  channel: string;
  transactionType: string;
}

export interface BillingAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}
export interface MonoResponse {
  status: string;
  message: string;
}
