import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AccountListing, EscrowOrder, KycStatus, MerchantSubscription } from '../types';
import { INITIAL_LISTINGS, INITIAL_ORDERS } from '../data/mockData';

// Clean the base Supabase URL in case it has trailing '/rest/v1/' or whitespace
const rawUrl =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  'https://tusvbmvkkhiklbbggyrt.supabase.co';

export const cleanSupabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').trim();

export const supabaseAnonKey = (
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_4kI2gAF6qrE-OyKZ4_7m8A_5L7OcFA-'
).trim();

export const isSupabaseConfigured = Boolean(cleanSupabaseUrl && supabaseAnonKey);

let clientInstance: SupabaseClient | null = null;

try {
  if (isSupabaseConfigured) {
    clientInstance = createClient(cleanSupabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined',
      },
    });
  }
} catch (e) {
  console.warn('Failed to initialize Supabase client:', e);
  clientInstance = null;
}

export const supabase = clientInstance;

export interface SupabaseUserProfile {
  id: string;
  name: string;
  phone: string;
  kycStatus: KycStatus;
  isProMerchant: boolean;
  completedSalesCount: number;
  activeDisputesCount: number;
  balanceMMK: number;
  heldInEscrowMMK: number;
  sellerRating: number;
  totalRatings: number;
  subscription?: MerchantSubscription;
}

export const DEFAULT_USER_PROFILE: SupabaseUserProfile = {
  id: 'current-user-1',
  name: 'Ko Min Thant',
  phone: '09798889901',
  kycStatus: 'VERIFIED',
  isProMerchant: true,
  completedSalesCount: 14,
  activeDisputesCount: 0,
  balanceMMK: 850000,
  heldInEscrowMMK: 320000,
  sellerRating: 4.95,
  totalRatings: 38,
  subscription: {
    isActive: true,
    plan: 'PRO_MONTHLY',
    subscribedAt: '2026-08-01T00:00:00Z',
    expiresAt: '2026-09-20T00:00:00Z',
    bumpQuotaRemaining: 18,
    bumpQuotaTotal: 20,
    monthlyFeeMMK: 25000,
    autoRenew: true,
  },
};

/**
 * Fetch marketplace listings from Supabase `listings` table
 * Falls back safely to INITIAL_LISTINGS with complete hydration safety
 */
export async function fetchLiveListings(): Promise<AccountListing[]> {
  if (!supabase) {
    return INITIAL_LISTINGS;
  }

  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      if (error) {
        console.info('Supabase listings table notice (using defaults):', error.message);
      }
      return INITIAL_LISTINGS;
    }

    const mapped: AccountListing[] = data.map((item: any) => ({
      id: item.id || `listing-${Date.now()}`,
      orderPrefix: item.order_prefix || item.orderPrefix || 'GZ-',
      gameType: item.game_type || item.gameType || 'mlbb',
      title: item.title || 'Game Account',
      description: item.description || '',
      priceMMK: Number(item.price_mmk || item.priceMMK || item.price || 0),
      priceUSDT: Number(item.price_usdt || item.priceUSDT || 0),
      status: (item.status?.toUpperCase() === 'SOLD' ? 'SOLD' : item.status?.toUpperCase() === 'IN_ESCROW' ? 'IN_ESCROW' : 'AVAILABLE'),
      isVerifiedSeller: Boolean(item.is_verified_seller ?? item.isVerifiedSeller ?? true),
      isProMerchant: Boolean(item.is_pro_merchant ?? item.isProMerchant ?? false),
      bumpedAt: item.bumped_at || item.bumpedAt,
      instantDelivery: Boolean(item.instant_delivery ?? item.instantDelivery ?? true),
      views: Number(item.views || 250),
      rating: Number(item.rating || 4.9),
      seller: {
        id: item.seller_id || item.seller?.id || 'seller-1',
        name: item.seller_name || item.seller?.name || 'Verified Merchant',
        avatar: item.seller_avatar || item.seller?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        phone: item.seller_phone || item.seller?.phone || '09798889901',
        tradesCompleted: Number(item.seller_trades_completed || item.seller?.tradesCompleted || 100),
        rating: Number(item.seller_rating || item.seller?.rating || 4.9),
        responseMinutes: Number(item.seller_response_minutes || item.seller?.responseMinutes || 3),
        joinedDate: item.seller_joined_date || item.seller?.joinedDate || '2023-11-12',
        isProMerchant: Boolean(item.is_pro_merchant || item.seller?.isProMerchant),
        merchantBadge: item.merchant_badge || item.seller?.merchantBadge || 'PRO_GOLD',
      },
      bindingStatus: item.binding_status || item.bindingStatus || 'Clean Bind / Email Transferable',
      attributes: item.attributes || {},
      imageUrls: Array.isArray(item.image_urls) && item.image_urls.length > 0
        ? item.image_urls
        : Array.isArray(item.images) && item.images.length > 0
        ? item.images
        : ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'],
      bannerUrl: item.banner_url || item.bannerUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      credentialPreview: item.credential_preview || item.credentialPreview || {
        authType: 'Moonton / Konami ID',
        maskedLogin: 'acc***@gmail.com',
        passwordMasked: '••••••••',
        backupCodes: 'Available',
        notes: 'Instant Escrow Auto Release',
      },
      createdAt: item.created_at || new Date().toISOString(),
    }));

    return mapped.length > 0 ? mapped : INITIAL_LISTINGS;
  } catch (err) {
    console.warn('Supabase fetch listings error, falling back to mock data:', err);
    return INITIAL_LISTINGS;
  }
}

/**
 * Fetch orders from Supabase `orders` table
 */
export async function fetchLiveOrders(): Promise<EscrowOrder[]> {
  if (!supabase) {
    return INITIAL_ORDERS;
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_ORDERS;
    }

    const mapped: EscrowOrder[] = data.map((item: any) => ({
      id: item.id || `ord-${Date.now()}`,
      orderNumber: item.order_number || item.orderNumber || `GZ-${Math.floor(100000 + Math.random() * 900000)}`,
      listingId: item.listing_id || item.listingId || 'ml-01',
      listing: item.listing || INITIAL_LISTINGS[0],
      buyerName: item.buyer_name || item.buyerName || 'Buyer',
      buyerPhone: item.buyer_phone || item.buyerPhone || '0912345678',
      sellerName: item.seller_name || item.sellerName || 'Seller',
      sellerPhone: item.seller_phone || item.sellerPhone || '09798889901',
      amountMMK: Number(item.amount_mmk || item.amountMMK || item.amount || 0),
      amountUSDT: Number(item.amount_usdt || item.amountUSDT || 0),
      paymentMethod: item.payment_method || item.paymentMethod || 'KBZ_PAY',
      paymentSlipUrl: item.payment_slip_url || item.paymentSlipUrl,
      transactionId: item.transaction_id || item.transactionId,
      senderPhone: item.sender_phone || item.senderPhone,
      status: item.status || 'ESCROW_LOCKED',
      credentials: item.credentials,
      createdAt: item.created_at || new Date().toISOString(),
      inspectionDeadline: item.inspection_deadline || item.inspectionDeadline,
      disputeInfo: item.dispute_info || item.disputeInfo,
      refundInfo: item.refund_info || item.refundInfo,
      chatMessages: Array.isArray(item.chat_messages) ? item.chat_messages : [],
    }));

    return mapped.length > 0 ? mapped : INITIAL_ORDERS;
  } catch (err) {
    console.warn('Supabase fetch orders error, falling back to mock data:', err);
    return INITIAL_ORDERS;
  }
}

/**
 * Fetch profile data for user from Supabase `profiles` table
 */
export async function fetchLiveProfile(userId: string = 'current-user-1'): Promise<SupabaseUserProfile> {
  if (!supabase) {
    return DEFAULT_USER_PROFILE;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_USER_PROFILE;
    }

    return {
      id: data.id || DEFAULT_USER_PROFILE.id,
      name: data.full_name || data.name || DEFAULT_USER_PROFILE.name,
      phone: data.phone || DEFAULT_USER_PROFILE.phone,
      kycStatus: (data.kyc_status as KycStatus) || DEFAULT_USER_PROFILE.kycStatus,
      isProMerchant: Boolean(data.is_pro_merchant ?? DEFAULT_USER_PROFILE.isProMerchant),
      completedSalesCount: typeof data.completed_sales_count === 'number' ? data.completed_sales_count : DEFAULT_USER_PROFILE.completedSalesCount,
      activeDisputesCount: typeof data.active_disputes_count === 'number' ? data.active_disputes_count : DEFAULT_USER_PROFILE.activeDisputesCount,
      balanceMMK: Number(data.balance_mmk ?? DEFAULT_USER_PROFILE.balanceMMK),
      heldInEscrowMMK: Number(data.held_in_escrow_mmk ?? DEFAULT_USER_PROFILE.heldInEscrowMMK),
      sellerRating: Number(data.seller_rating ?? DEFAULT_USER_PROFILE.sellerRating),
      totalRatings: Number(data.total_ratings ?? DEFAULT_USER_PROFILE.totalRatings),
      subscription: data.subscription || DEFAULT_USER_PROFILE.subscription,
    };
  } catch (err) {
    console.warn('Supabase fetch profile error, using default user profile:', err);
    return DEFAULT_USER_PROFILE;
  }
}
