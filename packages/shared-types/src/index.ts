export type UserRole =
  | "super_admin"
  | "reseller"
  | "admin_condominio"
  | "usuario_condominio";

export interface User<IdType = string> {
  _id: IdType;
  email: string;
  password_hash: string;
  role: UserRole;
  profile: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  preferences: {
    notifications_channel: "WHATSAPP" | "EMAIL" | "BOTH";
  };
  status: "active" | "inactive" | "blocked";
  condominium_id?: IdType;
  created_at: Date | string;
}

export interface Condominium<IdType = string> {
  _id: IdType;
  name: string;
  address: string;
  admin_id: IdType;
  reseller_id?: IdType;
  settings: {
    calculation_method: "m2" | "equitativo";
    currency: string;
    notifications: {
      enabled: boolean;
      whatsapp_provider?: string;
      whatsapp_instance_id?: string;
      ai_chatbot_enabled: boolean;
    };
    communication_channels: {
      whatsapp_enabled: boolean;
      email_enabled: boolean;
    };
    ai_config: {
      base_prompt: string;
      knowledge_base: string;
    };
  };
  amenities: string[];
}

export interface Unit<IdType = string> {
  _id: IdType;
  condominium_id: IdType;
  unit_number: string;
  owner_id: IdType;
  specs: {
    area_m2: number;
    aliquot_percentage: number;
  };
  current_balance: number;
}

export interface Expense<IdType = string> {
  _id: IdType;
  condominium_id: IdType;
  type: "FIXED" | "VARIABLE" | "RESERVE";
  category: string;
  description: string;
  amount: number;
  date: Date | string;
  invoice_url?: string;
  status: "active" | "voided";
}

export interface Receipt<IdType = string> {
  _id: IdType;
  unit_id: IdType;
  condominium_id: IdType;
  billing_period: string;
  total_amount: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  breakdown: {
    description: string;
    amount: number;
  }[];
  issued_date: Date | string;
  due_date: Date | string;
}

export interface Ticket<IdType = string> {
  _id: IdType;
  condominium_id: IdType;
  user_id: IdType;
  type: "MAINTENANCE_REPORT" | "AMENITY_RESERVATION";
  details: {
    description?: string;
    amenity?: string;
    reservation_date?: Date | string;
  };
  status: "OPEN" | "APPROVED" | "REJECTED" | "COMPLETED";
  ai_interaction_log: {
    role: "user" | "bot";
    msg: string;
    timestamp?: Date | string;
  }[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface SaaSPlan<IdType = string> {
  _id: IdType;
  name: string;
  code: string;
  max_units: number;
  monthly_price: number;
  currency: string;
  features: string[];
  ai_features_enabled?: boolean;
}

export interface Subscription<IdType = string> {
  _id: IdType;
  condominium_id: IdType;
  plan_id: IdType;
  start_date: Date | string;
  next_billing_date: Date | string;
  status: "active" | "past_due" | "canceled";
  billing_cycle: "monthly" | "annual";
  payment_method_token?: string;
}

export interface SaaSInvoice<IdType = string> {
  _id: IdType;
  subscription_id: IdType;
  condominium_id: IdType;
  amount: number;
  issue_date: Date | string;
  status: "paid" | "pending";
  pdf_url?: string;
}
