import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Bell,
  X,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  Zap,
  CheckCircle,
  ArrowRight,
  Clock,
  Trash2,
  CheckCheck,
} from 'lucide-react';

export interface AppNotification {
  id: string;
  type: 'ESCROW' | 'CHAT' | 'PROMO' | 'SYSTEM';
  title: string;
  titleMM?: string;
  message: string;
  messageMM?: string;
  timeAgo: string;
  isRead: boolean;
  actionTab?: 'orders' | 'marketplace' | 'profile' | 'seller';
  orderId?: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'ESCROW',
    title: 'Escrow Payment Verified',
    titleMM: 'Escrow ငွေလွှဲ အတည်ပြုပြီးပါပြီ',
    message: 'Payment of MMK 380,000 for Order #GZ-2026-88192 is locked in vault. 24h timer active.',
    messageMM: 'အမှာစာ #GZ-2026-88192 အတွက် ၃၈၀,၀၀၀ ကျပ်ကို Escrow Vault တွင် ထိန်းသိမ်းထားပြီး ၂၄ နာရီ စစ်ဆေးချိန် စတင်ပါပြီ။',
    timeAgo: '5 mins ago',
    isRead: false,
    actionTab: 'orders',
    orderId: 'ord_demo_901',
  },
  {
    id: 'notif-2',
    type: 'CHAT',
    title: 'New Message from Seller',
    titleMM: 'ရောင်းသူထံမှ မက်ဆေ့ခ်ျအသစ် ရောက်ရှိ',
    message: 'Ko Thura (eFootball Pro MM): "Konami ID အချက်အလက်များ ထည့်ပေးထားပါတယ်ဗျာ။"',
    messageMM: 'ကိုသူရ (eFootball Pro MM): "Konami ID အချက်အလက်များ ထည့်ပေးထားပါတယ်ဗျာ။"',
    timeAgo: '12 mins ago',
    isRead: false,
    actionTab: 'orders',
    orderId: 'ord_demo_901',
  },
  {
    id: 'notif-3',
    type: 'PROMO',
    title: 'Hot Deal: C6 Furina Whale Account',
    titleMM: 'အထူးလျှော့စျေး: Genshin C6 Whale Account',
    message: 'New Genshin Impact AR 60 Whale Account listed at special rate with 24k Primogems!',
    messageMM: 'Primogems ၂၄,၀၀၀ ပါဝင်သော Genshin Impact AR 60 အကောင့်သစ် စျေးကွက်သို့ ရောက်ရှိလာပါပြီ။',
    timeAgo: '1 hour ago',
    isRead: false,
    actionTab: 'marketplace',
  },
  {
    id: 'notif-4',
    type: 'SYSTEM',
    title: 'KYC Verification Approved',
    titleMM: 'KYC မှတ်ပုံတင် အတည်ပြုပြီးပါပြီ',
    message: 'Your Verified Seller badge is active. You can now list unlimited accounts with zero holding fee.',
    messageMM: 'သင်၏ Verified Seller တံဆိပ် အတည်ပြုပြီးပါပြီ။ အကောင့်များကို ကန့်သတ်ချက်မရှိ တင်ရောင်းနိုင်ပါပြီ။',
    timeAgo: '2 hours ago',
    isRead: true,
    actionTab: 'profile',
  },
];

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'marketplace' | 'orders' | 'sell' | 'admin' | 'seller' | 'schema' | 'profile', orderId?: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const { isMM } = useLanguage();
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'ALL' | 'ESCROW' | 'CHAT'>('ALL');

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notif: AppNotification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    if (notif.actionTab) {
      onNavigateTab(notif.actionTab, notif.orderId);
      onClose();
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'ESCROW') return n.type === 'ESCROW';
    if (filter === 'CHAT') return n.type === 'CHAT';
    return true;
  });

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'ESCROW':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'CHAT':
        return <MessageCircle className="w-4 h-4 text-cyan-400" />;
      case 'PROMO':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150 mt-12 sm:mt-0"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {isMM ? 'အသိပေးချက်များ' : 'Notifications'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {unreadCount > 0
                  ? isMM
                    ? `မဖတ်ရသေးသော အသိပေးချက် ${unreadCount} ခုရှိပါသည်`
                    : `${unreadCount} unread notifications`
                  : isMM
                  ? 'အသစ်များ အားလုံး ဖတ်ပြီးပါပြီ'
                  : 'All notifications are up to date'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-500 transition flex items-center gap-1 cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isMM ? 'အားလုံးဖတ်ပြီး' : 'Mark all read'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-950/30">
          {(['ALL', 'ESCROW', 'CHAT'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                filter === tab
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab === 'ALL'
                ? isMM ? 'အားလုံး' : 'All'
                : tab === 'ESCROW'
                ? 'Escrow'
                : isMM ? 'မက်ဆေ့ခ်ျ' : 'Chat'}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-2 space-y-1">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">
                {isMM ? 'အသိပေးချက် မရှိသေးပါ' : 'No notifications in this category'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3 sm:p-3.5 rounded-2xl transition cursor-pointer flex items-start gap-3 ${
                  notif.isRead
                    ? 'hover:bg-slate-100 dark:hover:bg-slate-800/50 opacity-80'
                    : 'bg-cyan-500/5 dark:bg-cyan-950/30 hover:bg-cyan-500/10 border border-cyan-500/20'
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5 shadow-sm">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {isMM && notif.titleMM ? notif.titleMM : notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notif.timeAgo}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                    {isMM && notif.messageMM ? notif.messageMM : notif.message}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                      <span>{isMM ? 'ကြည့်ရှုရန်' : 'View Action'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
