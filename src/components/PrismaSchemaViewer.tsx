import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Database, Copy, Check, FileCode, Server, ShieldCheck, Layers, BookOpen } from 'lucide-react';

const PRISMA_CODE = `// ==============================================================================
// GameZay MM - PostgreSQL & Prisma ORM Schema
// Tailored for Myanmar Game Account Escrow Marketplace
// Supports: eFootball, Mobile Legends, PUBG Mobile, Clash of Clans
// Payments: KBZPay, WaveMoney, AyaPay, CB Pay, USDT TRC20 / BEP20
// ==============================================================================

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  BUYER
  SELLER
  VERIFIED_SELLER
  ADMIN
}

enum GameType {
  EFOOTBALL
  MOBILE_LEGENDS
  PUBG_MOBILE
  CLASH_OF_CLANS
  FREE_FIRE
  GENSHIN_IMPACT
}

enum ListingStatus {
  DRAFT
  AVAILABLE
  IN_ESCROW
  SOLD
  REJECTED
  CANCELLED
}

enum EscrowStatus {
  PENDING_PAYMENT_PROOF    // Buyer created order, waiting for bank slip
  PAYMENT_VERIFYING        // Admin is checking the KPay / Wave slip
  ESCROW_LOCKED            // Money confirmed locked in GameZay platform account
  CREDENTIALS_DISPATCHED   // Buyer received decrypted game login details
  INSPECTION_PERIOD        // 24-hour buyer guarantee timer active
  COMPLETED                // Buyer confirmed or 24h passed -> Payout to Seller
  DISPUTED                 // Buyer/Seller opened dispute
  REFUNDED                 // Admin approved refund to buyer
}

enum PaymentMethod {
  KBZ_PAY
  WAVE_PAY
  AYA_PAY
  CB_PAY
  USDT_TRC20
  USDT_BEP20
}

enum PayoutStatus {
  REQUESTED
  PROCESSING
  TRANSFERRED
  REJECTED
}

enum DisputeStatus {
  OPEN
  UNDER_INVESTIGATION
  RESOLVED_BUYER_REFUND
  RESOLVED_SELLER_PAYOUT
  CLOSED
}

// ---------------------------------------------------------
// User Model (Buyers, Sellers, Admins)
// ---------------------------------------------------------
model User {
  id              String        @id @default(cuid())
  email           String?       @unique
  phoneNumber     String        @unique // Myanmar format: 09xxxxxxxxx
  name            String
  avatarUrl       String?
  role            Role          @default(BUYER)
  isKycVerified   Boolean       @default(false)
  kycDocType      String?       // NRC (National Registration Card) / Passport
  kycDocNumber    String?
  
  // Payout Wallet Config
  kpayNumber      String?
  kpayName        String?
  waveNumber      String?
  waveName        String?
  usdtAddress     String?
  
  // Reputation & Stats
  rating          Float         @default(5.0)
  totalSalesCount Int           @default(0)
  totalBuyCount   Int           @default(0)
  escrowVolumeMMK Decimal       @default(0) @db.Decimal(18, 2)
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Relationships
  listings        AccountListing[] @relation("SellerListings")
  buyerOrders     Order[]          @relation("BuyerOrders")
  sellerOrders    Order[]          @relation("SellerOrders")
  reviewsGiven    Review[]         @relation("BuyerReviews")
  reviewsReceived Review[]         @relation("SellerReviews")
  payouts         SellerPayout[]
  disputesFiled   DisputeCase[]    @relation("DisputeClaimant")

  @@index([phoneNumber])
  @@index([role])
}

// ---------------------------------------------------------
// Game Category Definition
// ---------------------------------------------------------
model GameCategory {
  id          String           @id @default(cuid())
  gameType    GameType         @unique
  nameEn      String
  nameMm      String
  iconUrl     String
  bannerUrl   String?
  isActive    Boolean          @default(true)
  
  listings    AccountListing[]

  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}

// ---------------------------------------------------------
// Account Listing Model (with Dynamic JSON Attributes)
// ---------------------------------------------------------
model AccountListing {
  id               String         @id @default(cuid())
  sellerId         String
  seller           User           @relation("SellerListings", fields: [sellerId], references: [id], onDelete: Cascade)
  
  categoryId       String
  category         GameCategory   @relation(fields: [categoryId], references: [id])
  gameType         GameType
  
  title            String
  description      String         @db.Text
  priceMMK         Decimal        @db.Decimal(18, 2) // e.g. 350,000 MMK
  priceUSDT        Decimal        @db.Decimal(10, 2) // e.g. 75.00 USDT
  status           ListingStatus  @default(AVAILABLE)
  
  // Dynamic JSON Attributes tailored per game
  attributes       Json
  
  // Proof Media (Screenshots / Video URLs)
  imageUrls        String[]
  previewVideoUrl  String?
  
  // Credential Link Status
  bindingStatus    String         // e.g. "Clean Konami ID / First-hand Mail", "Moonton all-unbindable"
  instantDelivery  Boolean        @default(true)
  viewCount        Int            @default(0)
  
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  // Relationships
  orders           Order[]
  credentialVault  CredentialVault?
  reviews          Review[]

  @@index([gameType])
  @@index([status])
  @@index([priceMMK])
}

// ---------------------------------------------------------
// Credential Vault (Encrypted Storage for Escrow Handoff)
// ---------------------------------------------------------
model CredentialVault {
  id               String         @id @default(cuid())
  listingId        String         @unique
  listing          AccountListing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  
  // AES-256 Encrypted Credential Payload
  encryptedPayload String         @db.Text
  loginIdentifier  String
  authType         String
  twoFactorCodes   String?        @db.Text
  transferGuide    String?        @db.Text
  
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
}

// ---------------------------------------------------------
// Order & Escrow Transaction Model
// ---------------------------------------------------------
model Order {
  id                  String         @id @default(cuid())
  orderNumber         String         @unique // Format: GZ-2026-XXXXX
  
  buyerId             String
  buyer               User           @relation("BuyerOrders", fields: [buyerId], references: [id])
  
  sellerId            String
  seller              User           @relation("SellerOrders", fields: [sellerId], references: [id])
  
  listingId           String
  listing             AccountListing @relation(fields: [listingId], references: [id])
  
  // Escrow Financials
  amountMMK           Decimal        @db.Decimal(18, 2)
  amountUSDT          Decimal        @db.Decimal(10, 2)
  escrowFeeMMK        Decimal        @default(0) @db.Decimal(18, 2)
  
  status              EscrowStatus   @default(PENDING_PAYMENT_PROOF)
  paymentMethod       PaymentMethod
  
  // Myanmar Bank / Wallet Payment Proof
  paymentSlipUrl      String?
  transactionId       String?
  senderAccountNo     String?
  adminVerifiedAt     DateTime?
  adminVerifierId     String?
  
  // 24h Buyer Inspection Warranty
  credentialsReleasedAt DateTime?
  inspectionExpiresAt   DateTime?
  completedAt           DateTime?
  
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  // Relationships
  dispute             DisputeCase?
  sellerPayout        SellerPayout?

  @@index([buyerId])
  @@index([sellerId])
  @@index([status])
  @@index([orderNumber])
}

// ---------------------------------------------------------
// Dispute Management
// ---------------------------------------------------------
model DisputeCase {
  id             String         @id @default(cuid())
  orderId        String         @unique
  order          Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  claimantId     String
  claimant       User           @relation("DisputeClaimant", fields: [claimantId], references: [id])
  
  reason         String
  description    String         @db.Text
  evidenceUrls   String[]
  
  status         DisputeStatus  @default(OPEN)
  adminDecision  String?        @db.Text
  resolvedAt     DateTime?
  
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}

// ---------------------------------------------------------
// Seller Payout (KPay, WavePay, USDT transfer)
// ---------------------------------------------------------
model SellerPayout {
  id              String        @id @default(cuid())
  sellerId        String
  seller          User          @relation(fields: [sellerId], references: [id])
  
  orderId         String        @unique
  order           Order         @relation(fields: [orderId], references: [id])
  
  amountMMK       Decimal       @db.Decimal(18, 2)
  payoutMethod    PaymentMethod
  targetWalletNo  String
  targetName      String?
  
  status          PayoutStatus  @default(REQUESTED)
  transferProofUrl String?
  txRefNumber     String?
  processedAt     DateTime?
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([sellerId])
  @@index([status])
}

// ---------------------------------------------------------
// Ratings & Reviews
// ---------------------------------------------------------
model Review {
  id          String         @id @default(cuid())
  listingId   String
  listing     AccountListing @relation(fields: [listingId], references: [id])
  
  buyerId     String
  buyer       User           @relation("BuyerReviews", fields: [buyerId], references: [id])
  
  sellerId    String
  seller      User           @relation("SellerReviews", fields: [sellerId], references: [id])
  
  rating      Int
  comment     String         @db.Text
  
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([sellerId])
  @@index([listingId])
}`;

export const PrismaSchemaViewer: React.FC = () => {
  const { t, isMM } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'schema' | 'relations' | 'commands'>('schema');

  const handleCopy = () => {
    navigator.clipboard.writeText(PRISMA_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-950/80 border border-purple-500/40 text-purple-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {t('prismaDoc.title')}
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-500/30">
                schema.prisma
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{t('prismaDoc.subtitle')}</p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? t('prismaDoc.copied') : t('prismaDoc.copySchema')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'schema'
              ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>{t('prismaDoc.architectureTab')}</span>
        </button>

        <button
          onClick={() => setActiveTab('relations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'relations'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('prismaDoc.diagramTab')}</span>
        </button>

        <button
          onClick={() => setActiveTab('commands')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'commands'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t('prismaDoc.guideTab')}</span>
        </button>
      </div>

      {/* Tab 1: Prisma Code */}
      {activeTab === 'schema' && (
        <div className="relative rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">prisma/schema.prisma</span>
            <span>PostgreSQL Dialect</span>
          </div>

          <pre className="p-6 text-xs font-mono text-cyan-300 leading-relaxed overflow-x-auto max-h-[70vh]">
            <code>{PRISMA_CODE}</code>
          </pre>
        </div>
      )}

      {/* Tab 2: Entity Relationships */}
      {activeTab === 'relations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-cyan-400">User Model</h4>
            <p className="text-xs text-slate-300">
              Role: BUYER, SELLER, VERIFIED_SELLER, ADMIN. Stores Myanmar phone (09...), KPay/Wave numbers, KYC documents (NRC), and seller reputation score.
            </p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-amber-400">AccountListing & JSON Attributes</h4>
            <p className="text-xs text-slate-300">
              Polymorphic dynamic JSON field storing specific attributes (eFootball OVR/Epics, MLBB Rank/Collector skins, PUBG Glacier Lvl/Mythics, COC TH16/Heroes).
            </p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-emerald-400">CredentialVault (AES Encrypted)</h4>
            <p className="text-xs text-slate-300">
              Stores raw login ID, password, 2FA recovery backup codes, and transfer steps. Unsealed only to verified buyer in Escrow room.
            </p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-purple-400">Order & Escrow State Machine</h4>
            <p className="text-xs text-slate-300">
              PENDING_PROOF → VERIFYING → ESCROW_LOCKED → CREDENTIALS_DISPATCHED → 24H_INSPECTION → COMPLETED.
            </p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-rose-400">DisputeCase & Resolution</h4>
            <p className="text-xs text-slate-300">
              1-to-1 relation with Order. Holds dispute reason, screenshots evidence URLs, and admin decision (Buyer refund vs Seller payout).
            </p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-blue-400">SellerPayout Model</h4>
            <p className="text-xs text-slate-300">
              Manages Myanmar wallet withdrawals (KBZPay, WaveMoney, USDT) with proof slip upload and transaction reference numbers.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: CLI Migration Commands */}
      {activeTab === 'commands' && (
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4 text-xs">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Quick Deployment & Migration Commands
          </h4>

          <div className="space-y-3">
            <div>
              <span className="text-slate-400 font-mono block mb-1">1. Install Prisma Dependencies:</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-cyan-300">
                npm install prisma @prisma/client
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-mono block mb-1">2. Run Migration on PostgreSQL:</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-emerald-300">
                npx prisma migrate dev --name init_gamezay_marketplace
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-mono block mb-1">3. Generate TypeScript Client:</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-amber-300">
                npx prisma generate
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-mono block mb-1">4. Open Prisma Visual Studio GUI:</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-purple-300">
                npx prisma studio
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
