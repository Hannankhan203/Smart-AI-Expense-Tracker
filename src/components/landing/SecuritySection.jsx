import React from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Database,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import Badge from '../common/Badge';

export default function SecuritySection() {
  const securityFeatures = [
    {
      icon: KeyRound,
      title: 'Secure Authentication',
      desc: 'Industry-standard JWT & token-based session management backed by Firebase Auth identity provider.',
    },
    {
      icon: Lock,
      title: 'Private Financial Data',
      desc: 'Your income and expenses are strictly isolated. No cross-user access or data leak risks.',
    },
    {
      icon: Database,
      title: 'Firebase Security Rules',
      desc: 'Firestore rules strictly enforce user-specific read/write permissions at the database document level.',
    },
    {
      icon: UserCheck,
      title: 'User-Owned Records',
      desc: 'You maintain 100% control over your data. Delete or export your transactions anytime with zero lock-in.',
    },
  ];

  return (
    <section id="security" className="py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="success" size="md" dot>
            Bank-Grade Security Architecture
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Your Privacy & Security Come First
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Engineered from the ground up with strict security rules, encrypted transmission, and zero unauthenticated data access.
          </p>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityFeatures.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-emerald-500/50 transition-colors space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Security Banner */}
        <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Firestore Security Protocol Active</h4>
              <p className="text-xs text-slate-400">
                All read and write queries enforce <code className="text-emerald-300 font-mono">request.auth.uid == resource.data.userId</code> rules.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Fully Verified
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
