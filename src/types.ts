export interface Order {
  id: string;
  fullName: string;
  companyName?: string;
  email: string;
  phone: string;
  whatsApp: string;
  serviceRequired: string;
  budget: string;
  deadline: string;
  projectDescription: string;
  fileName?: string;
  fileData?: string; // base64 payload
  additionalNotes?: string;
  status: 'pending' | 'confirmed' | 'completed';
  createdAt: string;
  transactionId?: string;
  paymentStatus: 'unpaid' | 'pending_verification' | 'paid';
}

export interface ServiceItem {
  id: string;
  name: string;
  category: 'web' | 'excel';
  description: string;
  features: string[];
  price: string;
  deliveryTime: string;
  iconName: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  mockupType: 'website' | 'dashboard' | 'spreadsheet';
  stats?: { label: string; value: string }[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}
