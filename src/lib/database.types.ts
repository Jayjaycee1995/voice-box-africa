
export type UserRole = 'client' | 'talent' | 'admin';
export type GigStatus = 'open' | 'assigned' | 'completed' | 'cancelled';
export type ProposalStatus = 'pending' | 'accepted' | 'rejected';
export type InvitationStatus = 'pending' | 'accepted' | 'declined';
export type GigVisibility = 'public' | 'invite-only';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  bio?: string;
  skills?: string; // JSON string or comma-separated
  portfolio_url?: string;
  profile_image?: string;
  is_available?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Gig {
  id: number;
  client_id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  category?: string;
  accent?: string;
  duration?: string;
  word_count?: number;
  status: GigStatus;
  language?: string;
  tone?: string;
  visibility: GigVisibility;
  delivery_file?: string;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: number;
  gig_id: number;
  talent_id: string;
  cover_letter: string;
  bid_amount: number;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
  // Relations
  gig?: Gig;
  talent?: User;
}

export interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  sender?: User;
  receiver?: User;
}

export interface Invitation {
  id: number;
  client_id: string;
  talent_id: string;
  gig_id: number;
  message?: string;
  status: InvitationStatus;
  created_at: string;
  updated_at: string;
  // Relations
  gig?: Gig;
  client?: User;
  talent?: User;
}

export interface Demo {
  id: number;
  user_id: string;
  title: string;
  file_path: string;
  duration?: string;
  type?: string;
  created_at: string;
  updated_at: string;
}

// Keeping these for compatibility if needed, but they are not in SUPABASE_SCHEMA.sql
export interface VoiceTalentProfile {
  user_id: string;
  bio?: string;
  languages: string[];
  accents: string[];
  tones: string[];
  price_per_word: number;
  availability_status: 'available' | 'busy';
  auto_verified: boolean;
  rating_avg?: number;
}

export interface Review {
  id: string;
  contract_id: string;
  client_id: string;
  voice_talent_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Contract {
  id: string;
  gig_id: string;
  client_id: string;
  voice_talent_id: string;
  final_price: number;
  deadline: string;
  status: 'pending-payment' | 'paid' | 'in-progress' | 'delivered' | 'completed' | 'disputed';
  created_at: string;
}

export interface Payment {
  id: string;
  contract_id: string;
  paystack_ref?: string;
  amount: number;
  escrow_status: 'pending' | 'held' | 'released' | 'refunded';
  payout_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}
