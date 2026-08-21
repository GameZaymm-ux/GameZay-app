export type Language = 'en' | 'mm';

export type Currency = 'MMK' | 'THB';

export type GameType = 'efootball' | 'mlbb' | 'pubg' | 'coc' | 'freefire' | 'genshin';

export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export type KycStatus = 'NOT_SUBMITTED' | 'UNSUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  username: string;
  phone?: string;
  avatarUrl?: string;
  kycStatus: KycStatus;
  isProMerchant: boolean;
  role: UserRole;
  balanceMMK: number;
  heldInEscrowMMK: number;
  sellerRating: number;
  totalRatings: number;
  createdAt?: string;
}

export interface KycSubmission {
  id: string;
  userId: string;
  fullName: string;
  idType: 'NRC' | 'PASSPORT' | 'THAI_ID';
  idNumber: string;
  phoneNumber: string;
  idFrontUrl: string;
  idBackUrl?: string;
  selfieUrl?: string;
  status: KycStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export type PaymentMethodCode = 
  | 'KBZ_PAY'
  | 'WAVE_PAY'
  | 'AYA_PAY'
  | 'CB_PAY'
  | 'KBANK'
  | 'KTB'
  | 'PROMPTPAY'
  | 'USDT_TRC20'
  | 'USDT_BEP20';

export interface PaymentOption {
  id: PaymentMethodCode;
  nameEn: string;
  nameMm: string;
  accountNumber: string;
  accountName: string;
  qrCodeUrl: string;
  badge: string;
  color: string;
  iconType: 'kpay' | 'wave' | 'aya' | 'cb' | 'thai_bank' | 'promptpay' | 'crypto';
  minAmountMMK: number;
}

export type EscrowStatus = 
  | 'PENDING_PAYMENT_PROOF'
  | 'PAYMENT_VERIFYING'
  | 'ESCROW_LOCKED'
  | 'CREDENTIALS_DISPATCHED'
  | 'CREDENTIALS_DELIVERED'
  | 'INSPECTION_PERIOD'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'REFUNDED'
  | 'CANCELLED';

export interface ChatMessage {
  id: string;
  orderId: string;
  senderRole: 'BUYER' | 'SELLER' | 'ADMIN' | 'SYSTEM';
  senderName: string;
  senderAvatar?: string;
  text: string;
  attachmentUrl?: string;
  attachmentType?: 'IMAGE' | 'PROOF' | 'CREDENTIAL';
  createdAt: string;
}

export interface DisputeInfo {
  reason: string;
  reasonCode?: string;
  description: string;
  filedAt: string;
  filedBy: string;
  proofUrls?: string[];
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_REFUND' | 'RESOLVED_RELEASE';
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface EfootballAttributes {
  division: number; // e.g. 1
  squadRating: number; // e.g. 104 or 3150
  epicCount: number; // e.g. 18
  showtimeCount: number; // e.g. 6
  coins?: number; // e.g. 1500 Coins
  gp?: number; // e.g. 2500000 GP
  konamiStatus: string; // "Clean First Hand" | "Linked / Transfer Available"
  platform: 'Android' | 'iOS' | 'PC / Console' | 'Android / iOS';
  highlightPlayers: string[]; // ["Big Time Messi", "Blitz Curler Salah", "Show Time Mbappe"]
}

export interface MLBBAttributes {
  currentRank: string; // "Mythical Immortal (140★)"
  peakRank: string; // "Immortal 180★"
  winRate: number; // 69.4%
  totalMatches: number; // 4800
  collectorSkins: number; // 8
  legendSkins: number; // 3
  epicSkins: number; // 42
  totalHeroes: number; // 126
  moontonStatus: string; // "All Unbind / Clean Email"
  signatureSkins: string[]; // ["Granger - Starfall Knight", "Gusion - Cosmic Gleam", "Chou - Iori Yagami"]
}

export interface PUBGAttributes {
  level: number; // 79
  tier: string; // "Ace Dominator"
  glacierLevel: string; // "M416 Glacier Max (Lvl 7)"
  upgradableGuns: number; // 9
  mythicFashion: number; // 48
  royalePassSeasons: string; // "RP Season 12 - A6 Max"
  linkStatus: string; // "Clean Twitter + Email Unlinkable"
  inventoryHighlights: string[]; // ["M4 Glacier Lvl 7", "Pharaoh X-Suit Lvl 4", "BAPE Hoodie"]
}

export interface COCAttributes {
  townHall: number; // 16
  kingLevel: number; // 95
  queenLevel: number; // 95
  wardenLevel: number; // 70
  champLevel: number; // 45
  gems: number; // 5200
  nameChange: string; // "Free Available (0 Gems)"
  builderHall: number; // 10
  wallLevel: number; // 17
  sceneryHighlights: string[]; // ["Epic Jungle Scenery", "10th Clashiversary"]
}

export type DynamicAttributes = EfootballAttributes | MLBBAttributes | PUBGAttributes | COCAttributes | Record<string, any>;

export interface MerchantSubscription {
  isActive: boolean;
  plan: 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'NONE';
  subscribedAt?: string;
  expiresAt?: string;
  bumpQuotaRemaining: number;
  bumpQuotaTotal: number;
  monthlyFeeMMK?: number;
  autoRenew: boolean;
}

export interface AccountListing {
  id: string;
  orderPrefix?: string;
  gameType: GameType;
  title: string;
  description: string;
  priceMMK: number;
  priceUSDT: number;
  status: 'AVAILABLE' | 'IN_ESCROW' | 'SOLD';
  isVerifiedSeller: boolean;
  isProMerchant?: boolean;
  bumpedAt?: string;
  instantDelivery: boolean;
  views: number;
  rating: number;
  seller: {
    id: string;
    name: string;
    avatar: string;
    phone: string;
    tradesCompleted: number;
    rating: number;
    responseMinutes: number;
    joinedDate: string;
    isProMerchant?: boolean;
    merchantBadge?: string;
  };
  bindingStatus: string;
  attributes: DynamicAttributes;
  imageUrls: string[];
  bannerUrl: string;
  credentialPreview: {
    authType: string;
    maskedLogin: string;
    passwordMasked: string;
    backupCodes: string;
    notes: string;
  };
  createdAt: string;
}

export interface BuyerRefundInfo {
  refundMethod: string;
  accountNumber: string;
  accountName: string;
  amountMMK: number;
  txId?: string;
  processedAt?: string;
  status: 'PENDING' | 'PROCESSED';
}

export interface EscrowOrder {
  id: string;
  orderNumber: string;
  listingId: string;
  listing: AccountListing;
  buyerName: string;
  buyerPhone: string;
  sellerName: string;
  sellerPhone: string;
  amountMMK: number;
  amountUSDT: number;
  paymentMethod: PaymentMethodCode;
  paymentSlipUrl?: string;
  transactionId?: string;
  senderPhone?: string;
  status: EscrowStatus;
  credentials?: {
    loginId: string;
    password: string;
    authType: string;
    backupCodes: string;
    transferNotes: string;
  };
  createdAt: string;
  inspectionDeadline?: string;
  disputeInfo?: DisputeInfo;
  refundInfo?: BuyerRefundInfo;
  chatMessages?: ChatMessage[];
}

export interface SellerPayoutRequest {
  id: string;
  orderNumber: string;
  sellerName: string;
  amountMMK: number;
  walletMethod: PaymentMethodCode | string;
  walletNumber: string;
  walletAccountName: string;
  status: 'PENDING' | 'PAID' | 'REJECTED';
  requestedAt: string;
}
