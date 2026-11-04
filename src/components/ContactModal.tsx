import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, MessageSquare, Phone } from 'lucide-react';
import { CONTACT_DATA } from '../data/projectsData';

interface ContactModalProps {
  type: 'wechat' | 'phone' | null;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ type, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!type) return null;

  const isWechat = type === 'wechat';
  const copyValue = isWechat ? CONTACT_DATA.wechatId : CONTACT_DATA.phoneNumber;

  const handleCopy = () => {
    navigator.clipboard.writeText(copyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm bg-[#faf8f5] rounded-3xl shadow-2xl border border-neutral-300/80 p-6 sm:p-8 z-10 flex flex-col items-center text-center space-y-5"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-200/80 hover:bg-neutral-300 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Header */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
            isWechat ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {isWechat ? <MessageSquare className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-neutral-900">
              {isWechat ? '微信联系人' : '电话联系'}
            </h3>
            <p className="text-xs text-neutral-500">
              {isWechat ? '扫描二维码或复制微信号添加' : '点击下方按钮直接拨打或复制号码'}
            </p>
          </div>

          {/* WeChat QR Card */}
          {isWechat && (
            <div className="w-48 h-48 bg-white p-3 rounded-2xl border border-neutral-200 shadow-md flex flex-col items-center justify-center space-y-2">
              {/* Simulated QR Code SVG */}
              <svg viewBox="0 0 100 100" className="w-36 h-36 fill-neutral-900">
                <rect x="0" y="0" width="30" height="30" rx="4" />
                <rect x="5" y="5" width="20" height="20" fill="white" rx="2" />
                <rect x="10" y="10" width="10" height="10" />

                <rect x="70" y="0" width="30" height="30" rx="4" />
                <rect x="75" y="5" width="20" height="20" fill="white" rx="2" />
                <rect x="80" y="10" width="10" height="10" />

                <rect x="0" y="70" width="30" height="30" rx="4" />
                <rect x="5" y="75" width="20" height="20" fill="white" rx="2" />
                <rect x="10" y="80" width="10" height="10" />

                {/* Random QR pixels */}
                <rect x="40" y="10" width="8" height="8" />
                <rect x="52" y="10" width="8" height="16" />
                <rect x="35" y="35" width="30" height="30" rx="2" />
                <circle cx="50" cy="50" r="8" fill="white" />
                <rect x="70" y="45" width="20" height="8" />
                <rect x="40" y="75" width="16" height="16" />
                <rect x="65" y="70" width="15" height="20" />
              </svg>
              <span className="text-[10px] text-neutral-400 font-mono tracking-tight">
                {CONTACT_DATA.wechatId}
              </span>
            </div>
          )}

          {/* Copy Box */}
          <div className="w-full bg-neutral-200/60 p-3 rounded-2xl flex items-center justify-between border border-neutral-300/50">
            <span className="text-sm font-mono font-bold text-neutral-800 pl-2">
              {copyValue}
            </span>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-900 hover:bg-black text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
