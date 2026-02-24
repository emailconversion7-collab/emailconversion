import { Check, Copy } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';

interface PatternSectionProps {
  title: string;
  icon: React.ReactNode;
  emails: string[];
  probability: string;
  description: string;
}

export const PatternSection: React.FC<PatternSectionProps> = ({
  title,
  icon,
  emails,
  probability,
  description,
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopied(email);
    setTimeout(() => setCopied(null), 2000);
  };

  if (emails.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="p-5 border-bottom border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">{icon}</div>
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              {title}
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-bold">
                {probability}
              </span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold">
                {emails.length} Created
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {emails.map((email) => (
            <div
              key={email}
              onClick={() => copyToClipboard(email)}
              className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer"
            >
              <span className="text-sm font-medium text-slate-700 truncate">{email}</span>
              <div className="flex-shrink-0 ml-2">
                {copied === email ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};