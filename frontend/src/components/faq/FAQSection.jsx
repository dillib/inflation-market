import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, Info, CheckCircle } from 'lucide-react';
import { Card } from '../ui/primitives';

export const HOME_FAQS = [
  {
    question: 'What is Inflation Market?',
    answer: `Inflation Market is a non-custodial protocol built around Monthly US CPI Epoch Pools. Everyday savers can hedge rising living costs in one click (Hedge Mode), while macro traders can stake USDC on whether the next official US CPI-U YoY print lands OVER or UNDER the monthly target—with zero leverage and zero liquidation risk.`,
    comparison: [
      'Unlike leveraged perpetuals that suffer from dead liquidity between monthly CPI prints, parimutuel epoch pools concentrate 100% of liquidity into each monthly CPI release.',
      'Traditional inflation hedges (TIPS, I Bonds) require banks and have strict limits; Inflation Market is permissionless and non-custodial.',
    ],
  },
  {
    question: 'Who is Inflation Market built for?',
    answer: `Individual savers who want simple protection against inflation spikes, and macro/DeFi traders who want clean, liquid exposure to monthly US CPI releases without managing leverage, funding rates, or liquidation prices.`,
    comparison: [
      'Traditional inflation swaps are institutional-only; this platform is permissionless and open to anyone with a Web3 wallet.',
      'Designed for 30-second participation: pick Hedge or Over/Under, enter USDC, and claim after the CPI print.',
    ],
  },
  {
    question: 'Is the platform live right now?',
    answer: `The web app is live with Interactive Preview mode and Arbitrum Sepolia smart contract support (CPIEpochPool.sol). Mainnet launch follows external security review and live oracle automation.`,
    comparison: [
      'Focused single-market design: one flagship US CPI-U YoY pool per monthly release instead of fragmented illiquid markets.',
    ],
  },
  {
    question: 'What market is supported?',
    answer: `US Consumer Price Index (CPI-U YoY), anchored to official monthly releases from the U.S. Bureau of Labor Statistics (BLS) and mirrored via the Federal Reserve (FRED) API.`,
    comparison: [
      'Concentrating all liquidity into one flagship monthly CPI pool ensures meaningful odds and zero cold-start fragmentation.',
    ],
  },
  {
    question: 'How do Monthly CPI Epoch Pools work?',
    answer: `Each monthly epoch sets a target CPI threshold (e.g. 2.80% YoY) and a lock deadline ahead of the BLS CPI release. Participants deposit USDC into OVER (inflation > target) or UNDER (inflation <= target). When the official CPI print is published, winners receive their original stake back plus a proportional share of the losing pool, minus a 1.5% protocol fee on profits.`,
    comparison: [
      'No leverage, no hourly funding rates, and no liquidations—your maximum downside is your USDC deposit.',
      'If an epoch only has deposits on one side or is cancelled, all participants can claim a 100% refund with zero fee.',
    ],
  },
  {
    question: 'What fees should I expect?',
    answer: `A 1.5% protocol fee is taken only from the losing pool upon settlement (0% fee if an epoch is one-sided or cancelled), plus standard Arbitrum network gas.`,
    comparison: [
      'No entry/exit spread, no hourly funding payments, and no liquidation penalties.',
    ],
  },
  {
    question: 'What makes the hybrid oracle different from existing feeds?',
    answer: `Our hybrid oracle requires multiple independent nodes to stake tokens, fetch data from official sources, and reach consensus before any price update is accepted. If a node submits bad data, they lose their stake (get "slashed") and are suspended. This creates strong incentives for honesty while distributing trust across multiple operators instead of relying on a single source.`,
    comparison: [
      'Single Chainlink aggregators or centralized APIs create a single point of failure; our multi-node consensus distributes trust.',
      'We combine official government data (BLS, Federal Reserve) with market proxies (inflation swap rates) and require multiple nodes to agree, reducing manipulation risk.',
    ],
  },
  {
    question: 'When will the token/governance be available?',
    answer: `Token design is underway. The token will govern oracle node onboarding, staking parameters, fee allocation, and insurance fund policies. Expect more details in Phase 2 as infrastructure solidifies.`,
    comparison: [
      'We’re committing to progressive decentralization rather than launching a token before the core mechanics are battle-tested.',
    ],
  },
  {
    question: 'How can I run a node or contribute?',
    answer: `Node operator guidelines (hardware, staking, API credentials) will release in Phase 1. Developers can contribute via GitHub pull requests, docs, or community discussions. If you’re interested in running a node or helping with data pipelines, join the Discord for early access.`,
    comparison: [
      'Unlike closed-source or oracle networks requiring partnerships, we intend to be fully open to qualified operators.',
    ],
  },
  {
    question: 'Where can I track progress and see data?',
    answer: `The hybrid oracle roadmap lives in docs/oracle/hybrid-oracle-plan.md. Dashboards for oracle updates, market metrics, and position analytics will launch before mainnet. You can also follow announcements and dev updates via Twitter, Discord, and GitHub.`,
    comparison: [
      'Transparency is a core feature—we plan to surface real-time oracle reports and market data, unlike black-box financial products.',
    ],
  },
];

const FAQItem = ({ faq, isOpen, onToggle }) => (
  <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
    isOpen
      ? 'border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 shadow-lg shadow-yellow-500/10'
      : 'border-white/10 bg-white/5 hover:border-yellow-500/20 hover:bg-white/10'
  }`}>
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-6 py-5 text-left text-white focus:outline-none group"
    >
      <span className={`text-lg font-bold transition-colors ${
        isOpen ? 'text-yellow-500' : 'text-white group-hover:text-yellow-500'
      }`}>
        {faq.question}
      </span>
      <div className={`flex-shrink-0 ml-4 p-1.5 rounded-full transition-all ${
        isOpen ? 'bg-yellow-500/20 rotate-180' : 'bg-white/10 group-hover:bg-yellow-500/10'
      }`}>
        <ChevronDown className={`h-5 w-5 transition-colors ${
          isOpen ? 'text-yellow-500' : 'text-gray-400 group-hover:text-yellow-500'
        }`} />
      </div>
    </button>
    {isOpen && (
      <div className="space-y-5 border-t border-yellow-500/20 px-6 py-6 animate-fadeIn">
        <p className="text-base text-gray-300 leading-relaxed">
          {faq.answer}
        </p>
        {faq.comparison && faq.comparison.length > 0 && (
          <div className="rounded-xl border border-yellow-500/30 bg-black/30 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-yellow-500" />
              <p className="text-sm font-bold text-yellow-500">
                How This Compares
              </p>
            </div>
            <ul className="space-y-2.5">
              {faq.comparison.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )}
  </div>
);

FAQItem.propTypes = {
  faq: PropTypes.shape({
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
    comparison: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-black via-yellow-500/5 to-black">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block mb-6 px-5 py-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
            <span className="text-yellow-500 text-sm font-bold tracking-wide">FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Everything You Need to Know
          </h2>
          <p className="text-xl text-gray-400 leading-relaxed">
            Transparent answers about what we're building, how the hybrid oracle works,
            and how Inflation Market compares to existing solutions.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3 mb-16">
          {HOME_FAQS.map((faq, index) => (
            <FAQItem
              key={faq.question}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* CTA Card */}
        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border-2 border-yellow-500/40 text-center p-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Info className="h-6 w-6 text-yellow-500" />
            <p className="text-xl font-bold text-white">Still Have Questions?</p>
          </div>
          <p className="text-base text-gray-300 mb-6 max-w-2xl mx-auto">
            Join our Discord, follow us on Twitter, or open a GitHub issue. We share weekly progress updates
            as we move through the hybrid oracle roadmap and trading milestones.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://discord.gg/inflationmarket"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
            >
              Join Discord
            </a>
            <a
              href="https://twitter.com/inflationmarket"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-white/20 transition-colors"
            >
              Follow on Twitter
            </a>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default FAQSection;
