// Database Types based on PRD requirements

export interface User {
  id: string;
  role: 'client' | 'talent' | 'admin';
  name: string;
  email: string;
  avatar_url?: string;
  profile_image?: string;
  bio?: string;
  skills?: string;
  location?: string;
  is_available?: boolean;
  created_at: string;
}

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

export interface Demo {
  id: string;
  voice_talent_id: string;
  title: string;
  audio_url: string;
  category: string;
  duration: number;
  bitrate: number;
}

export interface Gig {
  id: string;
  client_id: string;
  title: string;
  description: string;
  script_text?: string;
  budget?: number;
  language: string;
  accent: string;
  tone: string;
  deadline: string;
  visibility: 'public' | 'invite-only';
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Invitation {
  id: string;
  gig_id: string;
  voice_talent_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface Proposal {
  id: string;
  gig_id: string;
  voice_talent_id: string;
  bid_price: number;
  delivery_time: number; // hours
  proposal_text: string;
  demo_url?: string;
  status: 'submitted' | 'shortlisted' | 'rejected' | 'hired';
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

export interface Message {
  id: string;
  contract_id: string;
  sender_id: string;
  message: string;
  file_url?: string;
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

export interface Review {
  id: string;
  contract_id: string;
  client_id: string;
  voice_talent_id: string;
  rating: number;
  comment: string;
  created_at: string;
}