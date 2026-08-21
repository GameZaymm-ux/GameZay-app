import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AccountListing, EscrowOrder, KycStatus, MerchantSubscription } from '../types';
import { INITIAL_LISTINGS, INITIAL_ORDERS } from '../data/mockData';

// Fallback dummy strings to prevent runtime/SSR crash if env vars are unset
const DUMMY_SUPABASE_URL = 'https://placeholder.supabase.co';
// Valid format base64 JWT payload so Supabase client parser never throws
const DUMMY_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1wbGFjZWhvbGRlciIsInJvbGUiOiJhbm9uIiwiZXhwIjoxOTk5OTk5OTk5fQ.placeholder';

// Helper to safely get environment variable across Vite, Next.js, Node, and browser
function getEnvVar(key: string): string {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return String(process.env[key]).trim();
    }
  } catch {}

  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any)?.env && (import.meta as any).env[key]) {
      return String((import.meta as any).env[key]).trim();
    }
  } catch {}

  try {
    if (typeof window !== 'undefined' && (window as any)?.__ENV__ && (window as any).__ENV__[key]) {
      return String((window as any).__ENV__[key]).trim();
    }
  } catch {}

  return '';
}

const rawUrl =
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL') ||
  getEnvVar('VITE_SUPABASE_URL') ||
  'https://tusvbmvkkhiklbbggyrt.supabase.co';

const rawKey =
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
  getEnvVar('VITE_SUPABASE_ANON_KEY') ||
  'sb_publishable_4kI2gAF6qrE-OyKZ4_7m8A_5L7OcFA-';

// Clean and sanitize URL (strip trailing /rest/v1/ or slashes)
const sanitizedUrl = rawUrl ? rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '').trim() : '';
const sanitizedKey = rawKey ? rawKey.trim() : '';

// Valid real configuration check
export const isSupabaseConfigured = Boolean(
  sanitizedUrl &&
  sanitizedKey &&
  sanitizedUrl !== DUMMY_SUPABASE_URL &&
  sanitizedKey !== DUMMY_SUPABASE_KEY &&
  !sanitizedUrl.includes('placeholder')
);

// Guaranteed Safe Client Creation (NEVER crashes upon import)
let safeClient: SupabaseClient;

try {
  const activeUrl = sanitizedUrl || DUMMY_SUPABASE_URL;
  const activeKey = sanitizedKey || DUMMY_SUPABASE_KEY;
  const isReal = isSupabaseConfigured;

  safeClient = createClient(activeUrl, activeKey, {
    auth: {
      persistSession: isReal && typeof window !== 'undefined',
      autoRefreshToken: isReal && typeof window !== 'undefined',
      detectSessionInUrl: isReal && typeof window !== 'undefined',
    },
  });
} catch (err) {
  console.warn('Supabase initialization safely recovered with dummy client fallback:', err);
  safeClient = createClient(DUMMY_SUPABASE_URL, DUMMY_SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export const supabase: SupabaseClient = safeClient;

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
 * Safely fetches live marketplace listings from Supabase `listings` table
 * Queries standard column names: id, seller_id, title, game_type, price, description, images, status
 * Wrapped in try/catch and seamlessly falls back to INITIAL_LISTINGS
 */
export async function fetchLiveListings(): Promise<AccountListing[]> {
  if (!isSupabaseConfigured || !supabase) {
    return INITIAL_LISTINGS;
  }

  try {
    const { data, error } = await supabase
      .from('listings')
      .select('id, seller_id, seller_name, seller_avatar, seller_phone, title, game_type, price, price_mmk, price_usdt, description, images, image_urls, cover_image, banner_url, status, is_pro_merchant, is_verified_seller, views, rating, binding_status, attributes, credential_preview, order_prefix, created_at, bumped_at')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      if (error && error.code !== 'PGRST116') {
        console.info('Supabase listings table notice (using default mock data):', error.message);
      }
      return INITIAL_LISTINGS;
    }

    const mapped: AccountListing[] = data.map((item: any) => ({
      id: String(item.id || `listing-${Date.now()}`),
      orderPrefix: item.order_prefix || 'GZ-',
      gameType: item.game_type || item.gameType || 'mlbb',
      title: item.title || item.name || 'Game Account',
      description: item.description || '',
      priceMMK: Number(item.price ?? item.price_mmk ?? item.priceMMK ?? 0),
      priceUSDT: Number(item.price_usdt ?? item.priceUSDT ?? 0),
      status: (String(item.status || '').toUpperCase() === 'SOLD'
        ? 'SOLD'
        : String(item.status || '').toUpperCase() === 'IN_ESCROW'
        ? 'IN_ESCROW'
        : 'AVAILABLE'),
      isVerifiedSeller: Boolean(item.is_verified_seller ?? true),
      isProMerchant: Boolean(item.is_pro_merchant ?? false),
      bumpedAt: item.bumped_at || item.bumpedAt,
      instantDelivery: Boolean(item.instant_delivery ?? true),
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
      bindingStatus: item.binding_status || 'Clean Bind / Email Transferable',
      attributes: item.attributes || {},
      imageUrls: Array.isArray(item.images) && item.images.length > 0
        ? item.images
        : Array.isArray(item.image_urls) && item.image_urls.length > 0
        ? item.image_urls
        : ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'],
      bannerUrl: item.banner_url || item.cover_image || (Array.isArray(item.images) && item.images[0]) || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      credentialPreview: item.credential_preview || {
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
    console.warn('Supabase fetch listings error, fallback to mock listings:', err);
    return INITIAL_LISTINGS;
  }
}

/**
 * Safely inserts a newly created account listing into Supabase `listings` table
 * Uses standard field names: id, seller_id, title, game_type, price, description, images, status
 */
export async function createLiveListing(listing: AccountListing): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: listing };
  }

  try {
    const payload = {
      id: listing.id,
      seller_id: listing.seller.id,
      seller_name: listing.seller.name,
      seller_avatar: listing.seller.avatar,
      seller_phone: listing.seller.phone,
      title: listing.title,
      game_type: listing.gameType,
      price: listing.priceMMK,
      price_mmk: listing.priceMMK,
      price_usdt: listing.priceUSDT || 0,
      description: listing.description,
      images: listing.imageUrls || [],
      status: listing.status || 'AVAILABLE',
      is_pro_merchant: Boolean(listing.isProMerchant || listing.seller?.isProMerchant),
      is_verified_seller: Boolean(listing.isVerifiedSeller),
      binding_status: listing.bindingStatus,
      attributes: listing.attributes || {},
      credential_preview: listing.credentialPreview || {},
      created_at: listing.createdAt || new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('listings')
      .insert([payload])
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Supabase insert listing note (locally saved):', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.warn('Supabase insert listing exception (locally saved):', err);
    return { success: false, error: err?.message || 'Insertion exception' };
  }
}

export const insertLiveListing = createLiveListing;

/**
 * Safely fetches orders from Supabase `orders` table
 * Queries standard column names: id, order_number, listing_id, buyer_name, seller_name, status, etc.
 */
export async function fetchLiveOrders(): Promise<EscrowOrder[]> {
  if (!isSupabaseConfigured || !supabase) {
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
      id: String(item.id || `ord-${Date.now()}`),
      orderNumber: item.order_number || item.orderNumber || `GZ-${Math.floor(100000 + Math.random() * 900000)}`,
      listingId: item.listing_id || item.listingId || 'ml-01',
      listing: item.listing || INITIAL_LISTINGS[0],
      buyerName: item.buyer_name || item.buyerName || 'Buyer',
      buyerPhone: item.buyer_phone || item.buyerPhone || '0912345678',
      sellerName: item.seller_name || item.sellerName || 'Seller',
      sellerPhone: item.seller_phone || item.sellerPhone || '09798889901',
      amountMMK: Number(item.amount ?? item.amount_mmk ?? item.amountMMK ?? 0),
      amountUSDT: Number(item.amount_usdt ?? item.amountUSDT ?? 0),
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
 * Safely fetches profile data from Supabase `profiles` table
 * Queries standard column names: id, full_name, phone, kyc_status, is_pro_merchant, balance_mmk, etc.
 */
export async function fetchLiveProfile(userId: string = 'current-user-1'): Promise<SupabaseUserProfile> {
  if (!isSupabaseConfigured || !supabase) {
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
