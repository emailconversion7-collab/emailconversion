import {
  ArrowRight,
  ChevronRight,
  Database,
  Hash,
  Layers,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const quickLinks = [
  {
    to: '/all',
    title: 'All Patterns',
    description: 'Run every permutation group together and export once.',
    icon: <Layers className="w-5 h-5" />,
    badge: 'Complete',
  },
  {
    to: '/middle-name',
    title: 'Middle Name',
    description: 'Variations using middle names and middle initials.',
    icon: <Users className="w-5 h-5" />,
    badge: 'Focused',
  },
  {
    to: '/initial-based',
    title: 'Initial Based',
    description: 'Corporate-style formats with first/last initials.',
    icon: <ChevronRight className="w-5 h-5" />,
    badge: 'High Hit',
  },
  {
    to: '/common-human-choice',
    title: 'Common Human Choice',
    description: 'Most common real-world username structures.',
    icon: <Zap className="w-5 h-5" />,
    badge: 'Top Picks',
  },
  {
    to: '/short-number',
    title: 'Short Number',
    description: 'Short numeric suffix permutations from 1-10.',
    icon: <Hash className="w-5 h-5" />,
    badge: 'Numeric',
  },
  {
    to: '/bulk-csv',
    title: 'Bulk CSV',
    description: 'Upload a list and generate outputs at scale.',
    icon: <Database className="w-5 h-5" />,
    badge: 'Batch',
  },
];

export const HomePage = () => {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white p-8 md:p-10">
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold tracking-wide">
            <Sparkles className="w-4 h-4" />
            Email Conversion Suite
          </div>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight max-w-2xl">
            Generate professional email permutations on dedicated pages
          </h2>
          <p className="mt-3 text-sm md:text-base text-slate-200 max-w-2xl">
            Pick one focused converter or run all patterns. Each section has its own route, export flow, and clean UI
            for Vercel-hosted sharing.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/all"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-all"
            >
              Start With All Patterns
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/bulk-csv"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/30 bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-all"
            >
              Open Bulk CSV
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Converter Pages</h3>
            <p className="text-sm text-slate-500">Each code lives on its own webpage route.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {quickLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                  {item.badge}
                </span>
              </div>
              <h4 className="mt-4 text-base font-bold text-slate-900">{item.title}</h4>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{item.description}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
                Open page
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
