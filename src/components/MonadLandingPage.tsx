import { Button } from "../ui/components/Button";
import { IconWithBackground } from "../ui/components/IconWithBackground";
import EnhancedNavbar from "../ui/components/EnhancedNavbar";
import EnhancedFooter from "../ui/components/EnhancedFooter";
import Squares from "./Squares";
import {
  Clock,
  DollarSign,
  Globe,
  Shield,
  Bot,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { Bolt } from "./Icons";
import ConnectButton from "../utils/connect-wallet";
function AptosLandingPage() {
  return (
    <div className="flex h-full w-full flex-col items-start bg-default-background">
      {/* Navigation - Fixed position navbar */}
      <EnhancedNavbar transparent={true} />

      {/* Hero Section - First visible section with padding for navbar */}
      <div
        id="home"
        className="flex w-full flex-col items-center justify-center gap-12 b px-6 py-32 pt-40 relative overflow-hidden"
      >
        {/* Squares Background */}
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#f1f1f1"
          hoverFillColor="#F1F1F1"
        />

        {/* Animated Gradient Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-brand-50/10 to-transparent animate-pulse-slow z-0"></div>

        {/* Content */}
        <div className="flex w-full flex-col items-center justify-center gap-8 z-10">
          <div className="inline-block px-4 py-2 bg-brand-50 rounded-full mb-2">
            <span className="font-['Montserrat'] text-[14px] font-[700] text-brand-800">
              BUILT ON MONAD
            </span>
          </div>
          <span className="w-full max-w-[1024px] whitespace-pre-wrap font-['Montserrat'] text-[96px] font-[900] leading-[84px] text-brand-800 text-center -tracking-[0.04em] mobile:font-['Montserrat'] mobile:text-[52px] mobile:font-[900] mobile:leading-[68px] mobile:tracking-normal">
            {"Global Remittance"} <br />{" "}
            <span className="bg-gradient-to-r from-brand-800 to-brand-600 bg-clip-text text-transparent">
              Infrastructure
            </span>
          </span>

          <span className="w-full max-w-[768px] whitespace-pre-wrap font-['Montserrat'] text-[22px] font-[600] leading-[32px] text-brand-800 text-center -tracking-[0.015em]">
            {
              "Borderless payments infrastructure built on MONAD blockchain unifying VAT refunds and global payroll automation. Trustless, transparent, and instant remittance with AI-driven financial intelligence."
            }
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 z-10">
          <ConnectButton />
          <Button
            size="large"
            variant="neutral-secondary"
            onClick={() =>
              document
                .getElementById("features-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            icon={<ArrowRight size={20} />}
            className="px-8 py-6 hover:bg-brand-50 transition-all duration-300"
          >
            Learn More
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap justify-center gap-12 mt-12 z-10 w-full max-w-[1024px]">
          <div className="flex flex-col items-center">
            <span className="font-['Montserrat'] text-[36px] font-[900] text-brand-800">
              1s
            </span>
            <span className="font-['Montserrat'] text-[14px] font-[600] text-brand-600">
              Transaction Finality
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-['Montserrat'] text-[36px] font-[900] text-brand-800">
              95%
            </span>
            <span className="font-['Montserrat'] text-[14px] font-[600] text-brand-600">
              Lower Fees
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-['Montserrat'] text-[36px] font-[900] text-brand-800">
              190+
            </span>
            <span className="font-['Montserrat'] text-[14px] font-[600] text-brand-600">
              Countries Supported
            </span>
          </div>
        </div>
      </div>

      {/* Core Components Section */}
      <div
        id="features-section"
        className="flex w-full flex-col items-center justify-center gap-16 bg-neutral-100 px-6 py-32"
      >
        <div className="flex w-full max-w-[1280px] flex-col items-center gap-4">
          <span className="inline-block px-4 py-1 bg-brand-50 rounded-full mb-2">
            <span className="font-['Montserrat'] text-[12px] font-[700] text-brand-800">
              POWERED BY
            </span>
          </span>
          <span className="w-full font-['Montserrat'] text-[48px] font-[800] leading-[52px] text-default-font text-center -tracking-[0.02em]">
            Core Technology Stack
          </span>
          <p className="max-w-[768px] text-center text-subtext-color font-['Montserrat'] text-[18px] leading-[28px]">
            Our infrastructure combines blockchain reliability with AI
            intelligence to deliver a seamless financial experience
          </p>
        </div>

        <div className="w-full max-w-[1280px] grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Blockchain Layer */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col gap-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
                <img
                  className="h-8 object-contain"
                  src="/monad-logo.svg"
                  alt="Monad logo"
                />
              </div>
              <h3 className="font-['Montserrat'] text-[24px] font-[700]">
                Blockchain Layer
              </h3>
            </div>
            <p className="text-subtext-color font-['Montserrat'] text-[16px] leading-[24px]">
              Built on MONAD's high-performance EVM-compatible blockchain with ultra-low fees,
              1-second finality, and atomic transfers for guaranteed
              all-or-nothing payouts.
            </p>
            <div className="flex flex-wrap gap-2 mt-auto">
              <span className="px-3 py-1 bg-brand-50 rounded-full text-sm font-medium text-brand-800">
                1s Finality
              </span>
              <span className="px-3 py-1 bg-brand-50 rounded-full text-sm font-medium text-brand-800">
                0.001 MON Fee
              </span>
              <span className="px-3 py-1 bg-brand-50 rounded-full text-sm font-medium text-brand-800">
                USDC Support
              </span>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <img
                className="h-8 object-contain"
                src="/Aptos_mark_WHT.svg"
                alt="Aptos logo"
              />
              <img
                className="h-8 object-cover"
                alt="Pera Wallet logo"
                src="https://perawallet.s3.amazonaws.com/images/logo.svg"
              />
            </div>
          </div>

          {/* AI Intelligence Layer */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col gap-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
                <Bot size={24} className="text-brand-800" />
              </div>
              <h3 className="font-['Montserrat'] text-[24px] font-[700]">
                AI Intelligence
              </h3>
            </div>
            <p className="text-subtext-color font-['Montserrat'] text-[16px] leading-[24px]">
              AI-driven orchestration for parsing, compliance reasoning, and
              automation across multiple jurisdictions, powered by Bolt and
              Gemini.
            </p>
            <div className="flex flex-wrap gap-2 mt-auto">
              <span className="px-3 py-1 bg-brand-50 rounded-full text-sm font-medium text-brand-800">
                Tax Compliance
              </span>
              <span className="px-3 py-1 bg-brand-50 rounded-full text-sm font-medium text-brand-800">
                Automated Parsing
              </span>
              <span className="px-3 py-1 bg-brand-50 rounded-full text-sm font-medium text-brand-800">
                Smart Reasoning
              </span>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Bolt />
                <span className="font-['Montserrat'] text-[14px] font-[500] leading-[20px] text-default-font">
                  Bolt AI
                </span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Bot size={20} />
                <span className="font-['Montserrat'] text-[14px] font-[500] leading-[20px] text-default-font">
                  Gemini AI
                </span>
              </div>
            </div>
          </div>

          {/* Data & Storage Layer */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col gap-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
                <img
                  className="h-6 object-cover"
                  alt="Supabase logo"
                  src="https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png"
                />
              </div>
              <h3 className="font-['Montserrat'] text-[24px] font-[700]">
                Data & Storage
              </h3>
            </div>
            <p className="text-subtext-color font-['Montserrat'] text-[16px] leading-[24px]">
              Secure persistence for receipts, payruns, claims metadata, KYC
              profiles, and audit logs with Supabase backend and Oracle
              integration.
            </p>
            <div className="flex flex-wrap gap-2 mt-auto">
              <span className="px-3 py-1 bg-brand-50 rounded-full text-sm font-medium text-brand-800">
                Audit Logs
              </span>
              <span className="px-3 py-1 bg-brand-50 rounded-full text-sm font-medium text-brand-800">
                KYC Profiles
              </span>
              <span className="px-3 py-1 bg-brand-50 rounded-full text-sm font-medium text-brand-800">
                Oracle Layer
              </span>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <img
                className="h-8 object-cover"
                alt="Supabase logo"
                src="https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Feature Section */}
      <div className="flex w-full flex-col items-center justify-center gap-16 bg-default-background px-6 py-32">
        <div className="flex w-full max-w-[1280px] flex-col items-center gap-6">
          <span className="inline-block px-4 py-1 bg-brand-50 rounded-full">
            <span className="font-['Montserrat'] text-[12px] font-[700] text-brand-800">
              UNIFIED PLATFORM
            </span>
          </span>
          <span className="w-full max-w-[768px] font-['Montserrat'] text-[50px] font-[800] leading-[56px] text-brand-900 text-center -tracking-[0.025em]">
            Unifying Two Critical Financial Workflows
          </span>
          <p className="max-w-[768px] text-center text-subtext-color font-['Montserrat'] text-[18px] leading-[28px]">
            A single borderless payments infrastructure that solves both VAT
            refund inefficiencies and global payroll complexity
          </p>
        </div>

        <div className="w-full max-w-[1280px] flex flex-col gap-12">
          {/* Main Feature Card */}
          <div className="flex flex-col md:flex-row min-h-[500px] w-full rounded-[32px] bg-neutral-100 overflow-hidden shadow-xl">
            <div className="flex-1 relative overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
                alt="Global remittance"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-900/70 to-transparent flex items-center justify-center p-8">
                <div className="text-white max-w-[400px]">
                  <h3 className="font-['Montserrat'] text-[32px] font-[800] mb-4">
                    Borderless Payments
                  </h3>
                  <p className="font-['Montserrat'] text-[16px] leading-[24px] mb-6">
                    Zarfa's infrastructure eliminates geographical barriers,
                    enabling instant cross-border transactions with minimal
                    fees.
                  </p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white">
                      190+ Countries
                    </span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white">
                      Instant Transfers
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-start justify-center gap-8 p-12">
              <div className="flex flex-col items-start justify-center gap-6">
                <span className="font-['Montserrat'] text-[30px] font-[700] leading-[34px] text-default-font -tracking-[0.025em]">
                  Borderless Payments Infrastructure
                </span>
                <span className="whitespace-pre-wrap font-['Montserrat'] text-[18px] font-[400] leading-[26px] text-subtext-color -tracking-[0.01em]">
                  {
                    "Zarfa unifies VAT refunds for tourists and global payroll automation on a single trustless platform. Powered by Aptos's blockchain for instant finality and AI-driven compliance."
                  }
                </span>

                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                  <div className="flex flex-col gap-2 p-4 rounded-xl bg-white shadow-sm">
                    <div className="flex items-center gap-2">
                      <IconWithBackground
                        size="small"
                        variant="brand"
                        icon={<Globe />}
                      />
                      <span className="font-['Montserrat'] text-[14px] font-[600] leading-[20px] text-default-font">
                        VAT REFUNDS
                      </span>
                    </div>
                    <p className="text-sm text-subtext-color">
                      Instant tax refunds for tourists with near-zero fees
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 p-4 rounded-xl bg-white shadow-sm">
                    <div className="flex items-center gap-2">
                      <IconWithBackground
                        size="small"
                        variant="brand"
                        icon={<Wallet />}
                      />
                      <span className="font-['Montserrat'] text-[14px] font-[600] leading-[20px] text-default-font">
                        GLOBAL PAYROLL
                      </span>
                    </div>
                    <p className="text-sm text-subtext-color">
                      Automated salary disbursements across jurisdictions
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 p-4 rounded-xl bg-white shadow-sm">
                    <div className="flex items-center gap-2">
                      <IconWithBackground
                        size="small"
                        variant="brand"
                        icon={<Clock />}
                      />
                      <span className="font-['Montserrat'] text-[14px] font-[600] leading-[20px] text-default-font">
                        4-SECOND FINALITY
                      </span>
                    </div>
                    <p className="text-sm text-subtext-color">
                      No waiting for payments to clear or settle
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 p-4 rounded-xl bg-white shadow-sm">
                    <div className="flex items-center gap-2">
                      <IconWithBackground
                        size="small"
                        variant="brand"
                        icon={<Bot />}
                      />
                      <span className="font-['Montserrat'] text-[14px] font-[600] leading-[20px] text-default-font">
                        AI COMPLIANCE
                      </span>
                    </div>
                    <p className="text-sm text-subtext-color">
                      Automated regulatory compliance across borders
                    </p>
                  </div>
                </div>
              </div>

              <ConnectButton />
            </div>
          </div>

          {/* Feature Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-brand-50 rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-md">
                <Clock size={32} className="text-brand-800" />
              </div>
              <h3 className="font-['Montserrat'] text-[24px] font-[700] text-brand-900">
                Instant Transactions
              </h3>
              <p className="text-subtext-color mt-2">
                94% of transactions complete in under 4 seconds with Aptos's
                finality
              </p>
            </div>

            <div className="bg-brand-50 rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-md">
                <Shield size={32} className="text-brand-800" />
              </div>
              <h3 className="font-['Montserrat'] text-[24px] font-[700] text-brand-900">
                Military-Grade Security
              </h3>
              <p className="text-subtext-color mt-2">
                Multi-sig treasury and oracle signature verification for maximum
                protection
              </p>
            </div>

            <div className="bg-brand-50 rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-md">
                <DollarSign size={32} className="text-brand-800" />
              </div>
              <h3 className="font-['Montserrat'] text-[24px] font-[700] text-brand-900">
                95% Lower Fees
              </h3>
              <p className="text-subtext-color mt-2">
                Save up to 95% on transaction costs compared to traditional
                banking systems
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Benefits Section */}
      <div
        id="benefits-section"
        className="flex w-full flex-col items-center justify-center gap-16 bg-neutral-100 px-6 py-32 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        </div>

        <div className="flex w-full max-w-[1280px] flex-col items-center gap-6 z-10">
          <span className="inline-block px-4 py-1 bg-brand-50 rounded-full">
            <span className="font-['Montserrat'] text-[12px] font-[700] text-brand-800">
              WHY Zarfa
            </span>
          </span>
          <span className="w-full max-w-[768px] font-['Montserrat'] text-[48px] font-[800] leading-[52px] text-default-font text-center -tracking-[0.02em]">
            Trustless, Transparent, and Automated Remittance
          </span>
          <p className="max-w-[768px] text-center text-subtext-color font-['Montserrat'] text-[18px] leading-[28px]">
            Our blockchain-based infrastructure combines speed, security, and
            intelligence to revolutionize global financial workflows
          </p>
        </div>

        <div className="w-full max-w-[1280px] flex flex-col gap-12 z-10">
          {/* Main Benefits Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 4-Second Finality */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="h-48 bg-brand-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620228885847-9eab2a1adddc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Clock size={48} className="text-white" />
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-brand-50 rounded-full text-sm font-medium text-brand-800">
                    4 SECONDS
                  </span>
                  <span className="px-3 py-1 bg-green-50 rounded-full text-sm font-medium text-green-700">
                    94% SUCCESS RATE
                  </span>
                </div>
                <h3 className="font-['Montserrat'] text-[28px] font-[800] mb-4 text-default-font group-hover:text-brand-800 transition-colors">
                  Near-Instant Finality
                </h3>
                <p className="text-subtext-color font-['Montserrat'] text-[16px] leading-[24px] mb-6">
                  Experience near-instant finality for VAT refunds and payroll
                  transactions with Aptos's lightning-fast blockchain
                  technology.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center mt-1">
                      <span className="text-green-700 text-xs">✓</span>
                    </div>
                    <span className="text-default-font">
                      No flight delays for tourists awaiting VAT refunds
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center mt-1">
                      <span className="text-green-700 text-xs">✓</span>
                    </div>
                    <span className="text-default-font">
                      Eliminate payroll processing lag times
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center mt-1">
                      <span className="text-green-700 text-xs">✓</span>
                    </div>
                    <span className="text-default-font">
                      Immediate confirmation of transaction success
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Ultra-Low Fees */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="h-48 bg-brand-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526304760382-3591d3840148?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <DollarSign size={48} className="text-white" />
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-brand-50 rounded-full text-sm font-medium text-brand-800">
                    0.001 APT
                  </span>
                  <span className="px-3 py-1 bg-green-50 rounded-full text-sm font-medium text-green-700">
                    95% SAVINGS
                  </span>
                </div>
                <h3 className="font-['Montserrat'] text-[28px] font-[800] mb-4 text-default-font group-hover:text-brand-800 transition-colors">
                  Ultra-Low Transaction Fees
                </h3>
                <p className="text-subtext-color font-['Montserrat'] text-[16px] leading-[24px] mb-6">
                  Microtransactions become feasible for VAT refunds with just
                  0.001 APT per transaction, saving up to 95% compared to
                  traditional banking.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center mt-1">
                      <span className="text-green-700 text-xs">✓</span>
                    </div>
                    <span className="text-default-font">
                      Fraction of traditional banking fees
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center mt-1">
                      <span className="text-green-700 text-xs">✓</span>
                    </div>
                    <span className="text-default-font">
                      No hidden charges or intermediary costs
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center mt-1">
                      <span className="text-green-700 text-xs">✓</span>
                    </div>
                    <span className="text-default-font">
                      Cost-effective for businesses of all sizes
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* AI Intelligence */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="h-48 bg-brand-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1677442135968-8d288c3b6014?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Bot size={48} className="text-white" />
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-brand-50 rounded-full text-sm font-medium text-brand-800">
                    AI POWERED
                  </span>
                  <span className="px-3 py-1 bg-green-50 rounded-full text-sm font-medium text-green-700">
                    MULTI-JURISDICTION
                  </span>
                </div>
                <h3 className="font-['Montserrat'] text-[28px] font-[800] mb-4 text-default-font group-hover:text-brand-800 transition-colors">
                  AI-Driven Intelligence
                </h3>
                <p className="text-subtext-color font-['Montserrat'] text-[16px] leading-[24px] mb-6">
                  Advanced AI-driven compliance reasoning for tax rules, VAT
                  validation, and payroll automation across multiple
                  jurisdictions.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center mt-1">
                      <span className="text-green-700 text-xs">✓</span>
                    </div>
                    <span className="text-default-font">
                      Automated tax compliance across borders
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center mt-1">
                      <span className="text-green-700 text-xs">✓</span>
                    </div>
                    <span className="text-default-font">
                      Smart contract validation and enforcement
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center mt-1">
                      <span className="text-green-700 text-xs">✓</span>
                    </div>
                    <span className="text-default-font">
                      Continuous learning from transaction patterns
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Additional Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Shield size={32} className="text-brand-800" />
              </div>
              <div>
                <h3 className="font-['Montserrat'] text-[20px] font-[700] mb-2">
                  Military-Grade Security
                </h3>
                <p className="text-subtext-color">
                  Multi-sig treasury and oracle signature verification protect
                  all transactions with enterprise-level security
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Globe size={32} className="text-brand-800" />
              </div>
              <div>
                <h3 className="font-['Montserrat'] text-[20px] font-[700] mb-2">
                  Global Reach
                </h3>
                <p className="text-subtext-color">
                  Support for 190+ countries with localized compliance and
                  regulatory adherence built into the platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="flex w-full flex-col items-center justify-center gap-16 bg-default-background px-6 py-32">
        <div className="flex w-full max-w-[1280px] flex-col items-center gap-6">
          <span className="inline-block px-4 py-1 bg-brand-50 rounded-full">
            <span className="font-['Montserrat'] text-[12px] font-[700] text-brand-800">
              USE CASES
            </span>
          </span>
          <span className="w-full max-w-[768px] font-['Montserrat'] text-[48px] font-[800] leading-[52px] text-brand-900 text-center -tracking-[0.02em]">
            Real-World Applications
          </span>
          <p className="max-w-[768px] text-center text-subtext-color font-['Montserrat'] text-[18px] leading-[28px]">
            Zarfa combines VAT refunds for tourists and global payroll
            automation into a single borderless payments infrastructure with
            Web3 speed and AI-driven intelligence
          </p>
        </div>

        <div className="w-full max-w-[1280px]">
          {/* VAT Refunds Use Case */}
          <div className="flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden shadow-xl mb-12">
            <div className="md:w-1/2 bg-brand-900 p-12 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-700 rounded-bl-full opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-800 rounded-tr-full opacity-30"></div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                  <ArrowRight size={16} className="text-white" />
                  <span className="font-['Montserrat'] text-[12px] font-[700] text-white">
                    USE CASE 1
                  </span>
                </div>

                <h2 className="font-['Montserrat'] text-[40px] font-[800] text-white mb-6">
                  VAT Refunds
                </h2>

                <p className="text-white/90 font-['Montserrat'] text-[18px] leading-[28px] mb-8">
                  Streamline VAT refunds for tourists leaving Dubai and other
                  jurisdictions, solving delays, missed claims, and
                  inefficiencies in reclaiming tax with near-instant blockchain
                  payouts.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <h3 className="font-['Montserrat'] text-[18px] font-[700] text-white mb-2">
                      Tourist Experience
                    </h3>
                    <p className="text-white/80 text-sm">
                      Tourists scan their VAT tag at airport kiosks and receive
                      refunds directly to their wallet within seconds
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <h3 className="font-['Montserrat'] text-[18px] font-[700] text-white mb-2">
                      Retailer Benefits
                    </h3>
                    <p className="text-white/80 text-sm">
                      Retailers issue digital tags with minimal overhead and
                      attract more tax-conscious international shoppers
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-white/90">
                      85-87% refund rate (vs. 60-70% traditional)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-white/90">
                      No queues or paperwork at the airport
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-white/90">
                      90-day validation window
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
              <div className="mb-8">
                <h3 className="font-['Montserrat'] text-[24px] font-[700] text-brand-900 mb-4">
                  How It Works
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="font-['Montserrat'] font-bold text-brand-800">
                        1
                      </span>
                    </div>
                    <div>
                      <h4 className="font-['Montserrat'] text-[18px] font-[600] text-default-font">
                        Purchase & Tagging
                      </h4>
                      <p className="text-subtext-color">
                        Retailer issues invoice + tax-free tag. Tourist wallet
                        signs an ApplicationCall to Zarfa's VAT Contract.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="font-['Montserrat'] font-bold text-brand-800">
                        2
                      </span>
                    </div>
                    <div>
                      <h4 className="font-['Montserrat'] text-[18px] font-[600] text-default-font">
                        Airport Validation
                      </h4>
                      <p className="text-subtext-color">
                        Tourist scans tag at kiosk. Operator system validates
                        goods exported and pushes a signed webhook to Zarfa
                        Oracle.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="font-['Montserrat'] font-bold text-brand-800">
                        3
                      </span>
                    </div>
                    <div>
                      <h4 className="font-['Montserrat'] text-[18px] font-[600] text-default-font">
                        On-chain Payout
                      </h4>
                      <p className="text-subtext-color">
                        Tourist receives USDCa or APT via atomic transfer with
                        near-instant finality.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-100">
                  <h4 className="font-['Montserrat'] text-[16px] font-[700] text-default-font mb-2">
                    Real-World Example
                  </h4>
                  <p className="text-subtext-color mb-4">
                    A Japanese tourist purchases a luxury watch in Dubai Mall
                    for AED 50,000 (incl. 5% VAT = AED 2,500). Using Zarfa, they
                    scan the VAT tag at Dubai Airport and receive AED 2,125 (85%
                    of VAT) in USDC directly to their wallet before boarding
                    their flight.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-50 rounded-full text-xs font-medium text-green-700">
                      4s PAYOUT
                    </span>
                    <span className="px-3 py-1 bg-green-50 rounded-full text-xs font-medium text-green-700">
                      85% REFUND RATE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Global Payroll Use Case */}
          <div className="flex flex-col md:flex-row-reverse bg-white rounded-3xl overflow-hidden shadow-xl">
            <div className="md:w-1/2 bg-brand-800 p-12 relative">
              <div className="absolute top-0 left-0 w-32 h-32 bg-brand-700 rounded-br-full opacity-50"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand-600 rounded-tl-full opacity-30"></div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                  <Wallet size={16} className="text-white" />
                  <span className="font-['Montserrat'] text-[12px] font-[700] text-white">
                    USE CASE 2
                  </span>
                </div>

                <h2 className="font-['Montserrat'] text-[40px] font-[800] text-white mb-6">
                  Global Payroll
                </h2>

                <p className="text-white/90 font-['Montserrat'] text-[18px] leading-[28px] mb-8">
                  Automate payroll for distributed teams across jurisdictions,
                  reducing transaction fees, ensuring compliance, and enabling
                  instant on-chain salary payouts.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <h3 className="font-['Montserrat'] text-[18px] font-[700] text-white mb-2">
                      For Companies
                    </h3>
                    <p className="text-white/80 text-sm">
                      Reduce payroll processing costs by 95% while ensuring
                      regulatory compliance across multiple jurisdictions
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <h3 className="font-['Montserrat'] text-[18px] font-[700] text-white mb-2">
                      For Employees
                    </h3>
                    <p className="text-white/80 text-sm">
                      Receive salary payments instantly without intermediary
                      delays or excessive transfer fees
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-white/90">
                      Support for 190+ countries
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-white/90">
                      Automated tax compliance
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-white/90">
                      Bulk transfers up to 16 tx per group
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
              <div className="mb-8">
                <h3 className="font-['Montserrat'] text-[24px] font-[700] text-brand-900 mb-4">
                  How It Works
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="font-['Montserrat'] font-bold text-brand-800">
                        1
                      </span>
                    </div>
                    <div>
                      <h4 className="font-['Montserrat'] text-[18px] font-[600] text-default-font">
                        Payroll Preparation
                      </h4>
                      <p className="text-subtext-color">
                        HR uploads CSV/contracts. AI parses gross salary,
                        deductions, tax rules by jurisdiction and produces
                        structured transaction plan.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="font-['Montserrat'] font-bold text-brand-800">
                        2
                      </span>
                    </div>
                    <div>
                      <h4 className="font-['Montserrat'] text-[18px] font-[600] text-default-font">
                        Approval & Execution
                      </h4>
                      <p className="text-subtext-color">
                        CFO/HR dual-approves the payrun. Planner chunks
                        recipients into atomic groups and treasury key signs for
                        broadcast.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="font-['Montserrat'] font-bold text-brand-800">
                        3
                      </span>
                    </div>
                    <div>
                      <h4 className="font-['Montserrat'] text-[18px] font-[600] text-default-font">
                        Compliance & Reporting
                      </h4>
                      <p className="text-subtext-color">
                        All payouts logged on-chain with Supabase DB mirroring
                        transaction IDs for audit. AI exports formatted reports
                        for tax filings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-100">
                  <h4 className="font-['Montserrat'] text-[16px] font-[700] text-default-font mb-2">
                    Real-World Example
                  </h4>
                  <p className="text-subtext-color mb-4">
                    A tech startup with 50 employees across 12 countries
                    processes their monthly payroll of $250,000. Using Zarfa,
                    they save $11,250 in fees (vs. traditional banking), ensure
                    tax compliance across all jurisdictions, and complete all
                    payments in under 1 minute.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-50 rounded-full text-xs font-medium text-green-700">
                      95% FEE SAVINGS
                    </span>
                    <span className="px-3 py-1 bg-green-50 rounded-full text-xs font-medium text-green-700">
                      INSTANT SETTLEMENT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div
        id="about-section"
        className="flex w-full flex-col items-center justify-center gap-16 bg-neutral-100 px-6 py-32 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        </div>

        <div className="flex w-full max-w-[1280px] flex-col items-center gap-6 z-10">
          <span className="inline-block px-4 py-1 bg-brand-50 rounded-full">
            <span className="font-['Montserrat'] text-[12px] font-[700] text-brand-800">
              HOW IT WORKS
            </span>
          </span>
          <span className="w-full max-w-[768px] font-['Montserrat'] text-[48px] font-[800] leading-[52px] text-default-font text-center -tracking-[0.02em]">
            Dual Workflows with Zarfa
          </span>
          <p className="max-w-[768px] text-center text-subtext-color font-['Montserrat'] text-[18px] leading-[28px]">
            Our platform handles both VAT refunds and global payroll with
            streamlined, automated processes built on APTOS's blockchain
          </p>
        </div>

        {/* VAT Refund Flow */}
        <div className="w-full max-w-[1280px] z-10">
          <div className="flex flex-col gap-12">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-brand-900 flex items-center justify-center flex-shrink-0">
                    <ArrowRight size={32} className="text-white" />
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800 mb-2">
                      WORKFLOW 1
                    </span>
                    <h2 className="font-['Montserrat'] text-[32px] font-[800] text-brand-900">
                      VAT Refund Process
                    </h2>
                  </div>
                </div>

                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4 top-6 bottom-6 w-1 bg-brand-100"></div>

                  <div className="space-y-12 relative">
                    {/* Step 1 */}
                    <div className="flex gap-8">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-brand-900 flex items-center justify-center z-10 relative">
                          <span className="text-white font-bold">1</span>
                        </div>
                      </div>

                      <div className="flex-1 bg-neutral-50 rounded-xl p-6 border border-neutral-100 shadow-sm">
                        <h3 className="font-['Montserrat'] text-[24px] font-[700] text-brand-900 mb-4">
                          Purchase & Tagging
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="col-span-2">
                            <p className="text-subtext-color mb-4">
                              When a tourist makes a purchase at a participating
                              retailer, the store issues both a standard invoice
                              and a special tax-free tag. The tourist's wallet
                              then signs an ApplicationCall to Zarfa's VAT
                              Contract, opening a claim box keyed by a unique
                              claim_id.
                            </p>
                            <div className="flex flex-wrap gap-3">
                              <span className="px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800">
                                CLAIM ID GENERATED
                              </span>
                              <span className="px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800">
                                INVOICE HASH STORED
                              </span>
                              <span className="px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800">
                                WALLET LINKED
                              </span>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-inner border border-neutral-100">
                            <h4 className="font-['Montserrat'] text-[16px] font-[600] text-default-font mb-2">
                              Stored Metadata
                            </h4>
                            <ul className="space-y-2 text-sm text-subtext-color">
                              <li>• Tourist wallet address</li>
                              <li>• Invoice hash</li>
                              <li>• VAT amount paid</li>
                              <li>• Purchase timestamp</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-8">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-brand-900 flex items-center justify-center z-10 relative">
                          <span className="text-white font-bold">2</span>
                        </div>
                      </div>

                      <div className="flex-1 bg-neutral-50 rounded-xl p-6 border border-neutral-100 shadow-sm">
                        <h3 className="font-['Montserrat'] text-[24px] font-[700] text-brand-900 mb-4">
                          Airport Validation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="col-span-2">
                            <p className="text-subtext-color mb-4">
                              When departing the country, the tourist scans
                              their tax-free tag at an airport kiosk. The
                              operator system validates that the goods have been
                              exported according to local regulations and then
                              pushes a signed webhook to the Zarfa Oracle, which
                              triggers an on-chain state update to mark the
                              claim as VALIDATED.
                            </p>
                            <div className="flex flex-wrap gap-3">
                              <span className="px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800">
                                GOODS VERIFICATION
                              </span>
                              <span className="px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800">
                                ORACLE SIGNATURE
                              </span>
                              <span className="px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800">
                                STATE UPDATE
                              </span>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-inner border border-neutral-100">
                            <h4 className="font-['Montserrat'] text-[16px] font-[600] text-default-font mb-2">
                              Validation Rules
                            </h4>
                            <ul className="space-y-2 text-sm text-subtext-color">
                              <li>• Goods physically exported</li>
                              <li>• Within 90 days of purchase</li>
                              <li>• Signed by authorized operator</li>
                              <li>• No duplicate claims</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-8">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-brand-900 flex items-center justify-center z-10 relative">
                          <span className="text-white font-bold">3</span>
                        </div>
                      </div>

                      <div className="flex-1 bg-neutral-50 rounded-xl p-6 border border-neutral-100 shadow-sm">
                        <h3 className="font-['Montserrat'] text-[24px] font-[700] text-brand-900 mb-4">
                          On-chain Payout
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="col-span-2">
                            <p className="text-subtext-color mb-4">
                              Once validated, the smart contract computes the
                              refund amount (VAT * rate - fee) and the tourist
                              receives USDCa or APT via atomic transfer. The
                              treasury disburses funds in grouped transactions
                              (up to 16 per group) with near-instant finality,
                              ensuring the tourist receives their refund before
                              boarding their flight.
                            </p>
                            <div className="flex flex-wrap gap-3">
                              <span className="px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800">
                                ATOMIC TRANSFERS
                              </span>
                              <span className="px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800">
                                4s FINALITY
                              </span>
                              <span className="px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800">
                                AUDITABILITY
                              </span>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-inner border border-neutral-100">
                            <h4 className="font-['Montserrat'] text-[16px] font-[600] text-default-font mb-2">
                              Refund Calculation
                            </h4>
                            <ul className="space-y-2 text-sm text-subtext-color">
                              <li>• 85-87% of VAT amount</li>
                              <li>• ~AED 4.80 tag fee</li>
                              <li>• Choice of USDCa or APT</li>
                              <li>• Transaction notes with claim_id</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payroll Flow */}
        <div className="w-full max-w-[1280px] z-10">
          <div className="flex flex-col gap-12">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-brand-800 flex items-center justify-center flex-shrink-0">
                    <Wallet size={32} className="text-white" />
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800 mb-2">
                      WORKFLOW 2
                    </span>
                    <h2 className="font-['Montserrat'] text-[32px] font-[800] text-brand-900">
                      Global Payroll Process
                    </h2>
                  </div>
                </div>

                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4 top-6 bottom-6 w-1 bg-brand-100"></div>

                  <div className="space-y-12 relative">
                    {/* Step 1 */}
                    <div className="flex gap-8">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center z-10 relative">
                          <span className="text-white font-bold">1</span>
                        </div>
                      </div>

                      <div className="flex-1 bg-neutral-50 rounded-xl p-6 border border-neutral-100 shadow-sm">
                        <h3 className="font-['Montserrat'] text-[24px] font-[700] text-brand-900 mb-4">
                          Payroll Preparation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="col-span-2">
                            <p className="text-subtext-color mb-4">
                              The HR department uploads payroll data in CSV
                              format or through contracts into the Zarfa
                              dashboard. The AI layer parses the gross salary,
                              deductions, and tax rules by jurisdiction, then
                              produces a structured transaction plan with net
                              salaries, assets (USDCa/APT), and any necessary FX
                              conversions.
                            </p>
                            <div className="flex flex-wrap gap-3">
                              <span className="px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800">
                                AI PARSING
                              </span>
                              <span className="px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800">
                                TAX COMPLIANCE
                              </span>
                              <span className="px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800">
                                FX RATES
                              </span>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-inner border border-neutral-100">
                            <h4 className="font-['Montserrat'] text-[16px] font-[600] text-default-font mb-2">
                              AI Processing
                            </h4>
                            <ul className="space-y-2 text-sm text-subtext-color">
                              <li>• Jurisdiction detection</li>
                              <li>• Tax rule application</li>
                              <li>• Deduction calculation</li>
                              <li>• Transaction planning</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-8">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center z-10 relative">
                          <span className="text-white font-bold">2</span>
                        </div>
                      </div>

                      <div className="flex-1 bg-neutral-50 rounded-xl p-6 border border-neutral-100 shadow-sm">
                        <h3 className="font-['Montserrat'] text-[24px] font-[700] text-brand-900 mb-4">
                          Approval & Execution
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="col-span-2">
                            <p className="text-subtext-color mb-4">
                              The CFO and HR department must both approve the
                              payrun to ensure security and accuracy. Once
                              approved, a payrun_id snapshot is stored in both
                              Supabase and the Aptos VAT/Payroll App as an
                              immutable reference. The planner then chunks
                              recipients into atomic groups (up to 16
                              transactions per group) for efficient processing.
                            </p>
                            <div className="flex flex-wrap gap-3">
                              <span className="px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800">
                                DUAL APPROVAL
                              </span>
                              <span className="px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800">
                                ATOMIC GROUPS
                              </span>
                              <span className="px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800">
                                IMMUTABLE RECORD
                              </span>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-inner border border-neutral-100">
                            <h4 className="font-['Montserrat'] text-[16px] font-[600] text-default-font mb-2">
                              Security Features
                            </h4>
                            <ul className="space-y-2 text-sm text-subtext-color">
                              <li>• Multi-sig treasury</li>
                              <li>• Safety caps per payrun</li>
                              <li>• Expiry windows</li>
                              <li>• No double execution</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-8">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center z-10 relative">
                          <span className="text-white font-bold">3</span>
                        </div>
                      </div>

                      <div className="flex-1 bg-neutral-50 rounded-xl p-6 border border-neutral-100 shadow-sm">
                        <h3 className="font-['Montserrat'] text-[24px] font-[700] text-brand-900 mb-4">
                          Compliance & Reporting
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="col-span-2">
                            <p className="text-subtext-color mb-4">
                              All payouts are logged on-chain with transaction
                              notes containing the payrun_id and chunk number.
                              The Supabase database mirrors these transaction
                              IDs for audit purposes, creating a complete record
                              of all financial activities. The AI layer then
                              exports formatted reports suitable for tax filings
                              in each jurisdiction.
                            </p>
                            <div className="flex flex-wrap gap-3">
                              <span className="px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800">
                                ON-CHAIN LOGS
                              </span>
                              <span className="px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800">
                                AUDIT TRAIL
                              </span>
                              <span className="px-3 py-1 bg-brand-50 rounded-full text-xs font-medium text-brand-800">
                                TAX REPORTS
                              </span>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-inner border border-neutral-100">
                            <h4 className="font-['Montserrat'] text-[16px] font-[600] text-default-font mb-2">
                              Export Formats
                            </h4>
                            <ul className="space-y-2 text-sm text-subtext-color">
                              <li>• JSON/CSV exports</li>
                              <li>• Jurisdiction-specific formats</li>
                              <li>• Compliance documentation</li>
                              <li>• Audit-ready records</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="flex w-full flex-col items-center justify-center gap-12 bg-default-background px-6 py-32">
        <div className="flex w-full max-w-[1024px] flex-col items-center justify-center gap-8">
          <span className="w-full whitespace-pre-wrap font-['Montserrat'] text-[62px] font-[900] leading-[58px] text-brand-900 text-center -tracking-[0.04em] mobile:font-['Montserrat'] mobile:text-[40px] mobile:font-[900] mobile:leading-[40px] mobile:tracking-normal">
            {" CHOOSE Zarfa FOR BORDERLESS PAYMENTS"}
          </span>
          <span className="max-w-[768px] whitespace-pre-wrap font-['Montserrat'] text-[20px] font-[400] leading-[28px] text-default-font text-center -tracking-[0.015em]">
            {
              "Combining Web3 speed with AI-driven financial intelligence for VAT refunds and global payroll on a single trustless platform."
            }
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-6">
          <span className="max-w-[768px] whitespace-pre-wrap font-['Montserrat'] text-[20px] font-[600] leading-[28px] text-brand-900 underline text-center -tracking-[0.015em]">
            <ConnectButton />
          </span>
        </div>
      </div>

      {/* Pricing Section */}
      <div
        id="pricing-section"
        className="flex w-full flex-col items-center justify-center gap-12 bg-neutral-100 px-6 py-32"
      >
        <div className="flex w-full max-w-[1024px] flex-col items-center justify-center gap-8">
          <span className="w-full whitespace-pre-wrap font-['Montserrat'] text-[62px] font-[900] leading-[58px] text-brand-900 text-center -tracking-[0.04em] mobile:font-['Montserrat'] mobile:text-[40px] mobile:font-[900] mobile:leading-[40px] mobile:tracking-normal">
            {"CHOOSE YOUR PLAN"}
          </span>
          <span className="max-w-[768px] whitespace-pre-wrap font-['Montserrat'] text-[20px] font-[400] leading-[28px] text-default-font text-center -tracking-[0.015em]">
            {
              "Start free and scale with confidence. Our pricing grows with your team size while keeping costs predictable."
            }
          </span>
        </div>
        <div className="flex w-full max-w-[1280px] flex-wrap items-stretch justify-center gap-6 mobile:flex-col mobile:flex-wrap mobile:gap-6">
          {/* Starter Plan */}
          <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-start gap-8 self-stretch rounded-[32px] bg-default-background px-8 py-12">
            <div className="flex w-full flex-col items-start gap-6">
              <div className="flex flex-col items-start gap-2">
                <span className="font-['Montserrat'] text-[30px] font-[700] leading-[34px] text-default-font -tracking-[0.025em]">
                  Starter
                </span>
                <span className="font-['Montserrat'] text-[18px] font-[400] leading-[26px] text-subtext-color -tracking-[0.01em]">
                  Perfect for small teams getting started with blockchain
                  payroll
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-['Montserrat'] text-[48px] font-[900] leading-[44px] text-brand-900 -tracking-[0.04em]">
                  Free
                </span>
                <span className="font-['Montserrat'] text-[18px] font-[400] leading-[26px] text-subtext-color -tracking-[0.01em]">
                  forever
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-4">
              <div className="flex items-center gap-3">
                <IconWithBackground
                  variant="success"
                  size="small"
                  icon={<Shield />}
                />
                <span className="font-['Montserrat'] text-[16px] font-[500] leading-[22px] text-default-font">
                  Up to 5 employees
                </span>
              </div>
              <div className="flex items-center gap-3">
                <IconWithBackground
                  variant="success"
                  size="small"
                  icon={<Shield />}
                />
                <span className="font-['Montserrat'] text-[16px] font-[500] leading-[22px] text-default-font">
                  Basic payroll processing
                </span>
              </div>
              <div className="flex items-center gap-3">
                <IconWithBackground
                  variant="success"
                  size="small"
                  icon={<Shield />}
                />
                <span className="font-['Montserrat'] text-[16px] font-[500] leading-[22px] text-default-font">
                  APT & USDC payments
                </span>
              </div>
              <div className="flex items-center gap-3">
                <IconWithBackground
                  variant="success"
                  size="small"
                  icon={<Shield />}
                />
                <span className="font-['Montserrat'] text-[16px] font-[500] leading-[22px] text-default-font">
                  Email support
                </span>
              </div>
            </div>
            <ConnectButton />
          </div>

          {/* Professional Plan */}
          <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-start gap-8 self-stretch rounded-[32px] bg-brand-900 px-8 py-12 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-default-background rounded-full px-4 py-2">
              <span className="font-['Montserrat'] text-[14px] font-[700] leading-[18px] text-brand-900">
                MOST POPULAR
              </span>
            </div>
            <div className="flex w-full flex-col items-start gap-6">
              <div className="flex flex-col items-start gap-2">
                <span className="font-['Montserrat'] text-[30px] font-[700] leading-[34px] text-white -tracking-[0.025em]">
                  Professional
                </span>
                <span className="font-['Montserrat'] text-[18px] font-[400] leading-[26px] text-white -tracking-[0.01em]">
                  Ideal for growing companies with advanced payroll needs
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-['Montserrat'] text-[48px] font-[900] leading-[44px] text-white -tracking-[0.04em]">
                  $29
                </span>
                <span className="font-['Montserrat'] text-[18px] font-[400] leading-[26px] text-white -tracking-[0.01em]">
                  per month
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-4">
              <div className="flex items-center gap-3">
                <IconWithBackground
                  variant="success"
                  size="small"
                  icon={<Shield />}
                />
                <span className="font-['Montserrat'] text-[16px] font-[500] leading-[22px] text-white">
                  Up to 50 employees
                </span>
              </div>
              <div className="flex items-center gap-3">
                <IconWithBackground
                  variant="success"
                  size="small"
                  icon={<Shield />}
                />
                <span className="font-['Montserrat'] text-[16px] font-[500] leading-[22px] text-white">
                  Advanced analytics & reporting
                </span>
              </div>
              <div className="flex items-center gap-3">
                <IconWithBackground
                  variant="success"
                  size="small"
                  icon={<Shield />}
                />
                <span className="font-['Montserrat'] text-[16px] font-[500] leading-[22px] text-white">
                  Multi-currency support
                </span>
              </div>
              <div className="flex items-center gap-3">
                <IconWithBackground
                  variant="success"
                  size="small"
                  icon={<Shield />}
                />
                <span className="font-['Montserrat'] text-[16px] font-[500] leading-[22px] text-white">
                  AI-powered insights
                </span>
              </div>
              <div className="flex items-center gap-3">
                <IconWithBackground
                  variant="success"
                  size="small"
                  icon={<Shield />}
                />
                <span className="font-['Montserrat'] text-[16px] font-[500] leading-[22px] text-white">
                  Priority support
                </span>
              </div>
            </div>
            <ConnectButton />
          </div>

          {/* Enterprise Plan */}
          <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-start gap-8 self-stretch rounded-[32px] bg-default-background px-8 py-12">
            <div className="flex w-full flex-col items-start gap-6">
              <div className="flex flex-col items-start gap-2">
                <span className="font-['Montserrat'] text-[30px] font-[700] leading-[34px] text-default-font -tracking-[0.025em]">
                  Enterprise
                </span>
                <span className="font-['Montserrat'] text-[18px] font-[400] leading-[26px] text-subtext-color -tracking-[0.01em]">
                  Custom solutions for large organizations and enterprises
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-['Montserrat'] text-[48px] font-[900] leading-[44px] text-brand-900 -tracking-[0.04em]">
                  Custom
                </span>
                <span className="font-['Montserrat'] text-[18px] font-[400] leading-[26px] text-subtext-color -tracking-[0.01em]">
                  pricing
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-4">
              <div className="flex items-center gap-3">
                <IconWithBackground
                  variant="success"
                  size="small"
                  icon={<Shield />}
                />
                <span className="font-['Montserrat'] text-[16px] font-[500] leading-[22px] text-default-font">
                  Unlimited employees
                </span>
              </div>
              <div className="flex items-center gap-3">
                <IconWithBackground
                  variant="success"
                  size="small"
                  icon={<Shield />}
                />
                <span className="font-['Montserrat'] text-[16px] font-[500] leading-[22px] text-default-font">
                  Custom integrations
                </span>
              </div>
              <div className="flex items-center gap-3">
                <IconWithBackground
                  variant="success"
                  size="small"
                  icon={<Shield />}
                />
                <span className="font-['Montserrat'] text-[16px] font-[500] leading-[22px] text-default-font">
                  Dedicated account manager
                </span>
              </div>
              <div className="flex items-center gap-3">
                <IconWithBackground
                  variant="success"
                  size="small"
                  icon={<Shield />}
                />
                <span className="font-['Montserrat'] text-[16px] font-[500] leading-[22px] text-default-font">
                  White-label options
                </span>
              </div>
              <div className="flex items-center gap-3">
                <IconWithBackground
                  variant="success"
                  size="small"
                  icon={<Shield />}
                />
                <span className="font-['Montserrat'] text-[16px] font-[500] leading-[22px] text-default-font">
                  24/7 phone support
                </span>
              </div>
            </div>
            <ConnectButton />
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="flex w-full flex-col items-center justify-center gap-12 bg-neutral-100 px-6 py-32">
        <div className="flex w-full flex-col items-center justify-center gap-6">
          <div className="flex w-full max-w-[1280px] flex-wrap items-center justify-center gap-6 mobile:flex-col mobile:flex-wrap mobile:gap-6">
            <div className="flex min-h-[384px] min-w-[240px] max-w-[384px] grow shrink-0 basis-0 flex-col items-start justify-end gap-8 self-stretch rounded-[32px] bg-default-background px-8 py-8 mobile:min-h-[384px] mobile:w-full mobile:min-w-[240px] mobile:grow mobile:shrink-0 mobile:basis-0">
              <div className="flex w-full flex-col items-start justify-center gap-4">
                <span className="max-w-[384px] whitespace-pre-wrap font-['Montserrat'] text-[30px] font-[700] leading-[34px] text-brand-900 -tracking-[0.025em]">
                  {"Stay up to date with Zarfa\n"}
                </span>
                <span className="w-full max-w-[576px] whitespace-pre-wrap font-['Montserrat'] text-[18px] font-[400] leading-[26px] text-default-font -tracking-[0.01em]">
                  {
                    "Get the latest updates and news from our blockchain payroll platform.\n"
                  }
                </span>
              </div>
            </div>
            <div className="flex min-h-[384px] min-w-[320px] max-w-[1280px] grow shrink-0 basis-0 flex-col items-start justify-end gap-8 self-stretch rounded-[32px] bg-neutral-900 px-8 py-8">
              <div className="flex w-full flex-col items-start justify-center gap-4">
                <span className="max-w-[384px] whitespace-pre-wrap font-['Montserrat'] text-[30px] font-[700] leading-[34px] text-white -tracking-[0.025em]">
                  {"Be a part of something revolutionary"}
                </span>
                <span className="w-full max-w-[576px] whitespace-pre-wrap font-['Montserrat'] text-[18px] font-[400] leading-[26px] text-white -tracking-[0.01em]">
                  {
                    "Our flagship blockchain payroll platform offers the best and seamless way to way employees of all sizes."
                  }
                </span>
              </div>
            </div>
          </div>
          <div className="flex w-full max-w-[1280px] flex-wrap items-center justify-center gap-6 mobile:flex-col mobile:flex-wrap mobile:gap-6">
            <div className="flex min-h-[384px] min-w-[240px] max-w-[384px] grow shrink-0 basis-0 flex-col items-start justify-end gap-8 self-stretch rounded-[32px] bg-default-background px-8 py-8 mobile:min-h-[384px] mobile:w-full mobile:min-w-[240px] mobile:grow mobile:shrink-0 mobile:basis-0">
              <div className="flex w-full flex-col items-start justify-center gap-4">
                <span className="max-w-[384px] whitespace-pre-wrap font-['Montserrat'] text-[30px] font-[700] leading-[34px] text-brand-900 -tracking-[0.025em]">
                  {"The trusted payroll system on the Blockchain"}
                </span>
                <span className="w-full max-w-[576px] whitespace-pre-wrap font-['Montserrat'] text-[18px] font-[400] leading-[26px] text-default-font -tracking-[0.01em]">
                  {
                    "Experience the ease with payment on the Aptos blockchain for your global payroll solution.\n"
                  }
                </span>
              </div>
            </div>
            <div className="flex min-h-[384px] min-w-[320px] max-w-[1280px] grow shrink-0 basis-0 flex-col items-start justify-end gap-8 self-stretch rounded-[32px] bg-brand-900 px-8 py-8">
              <div className="flex w-full flex-col items-start justify-center gap-4">
                <span className="max-w-[384px] whitespace-pre-wrap font-['Montserrat'] text-[30px] font-[700] leading-[34px] text-white -tracking-[0.025em]">
                  {"Zarfa:\nPayroll Solution"}
                </span>
                <span className="w-full max-w-[576px] whitespace-pre-wrap font-['Montserrat'] text-[18px] font-[400] leading-[26px] text-white -tracking-[0.01em]">
                  {
                    "Discover how we aim to revolutionize global payroll, and make paying your employees seamless."
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        id="pricing-section"
        className="flex w-full flex-col items-center justify-center gap-6 bg-gradient-to-br from-brand-900 to-brand-800 px-6 py-32 mobile:flex relative overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-700 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-800 rounded-full opacity-20 blur-3xl"></div>

        <div className="flex w-full max-w-[1280px] flex-col items-center justify-center gap-8 rounded-[32px] bg-default-background px-6 pt-24 pb-16 shadow-2xl relative z-10">
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-brand-900 text-white px-8 py-4 rounded-full shadow-lg">
            <span className="font-['Montserrat'] text-[18px] font-[700]">
              Ready to Transform Your Financial Operations?
            </span>
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-6">
            <span className="w-full max-w-[768px] whitespace-pre-wrap font-['Montserrat'] text-[72px] font-[900] leading-[68px] text-brand-900 text-center -tracking-[0.04em] mobile:font-['Montserrat'] mobile:text-[48px] mobile:font-[900] mobile:leading-[44px] mobile:tracking-normal">
              {"START TODAY"}
            </span>
            <span className="w-full max-w-[768px] whitespace-pre-wrap font-['Montserrat'] text-[20px] font-[500] leading-[28px] text-brand-900 text-center -tracking-[0.015em]">
              {
                "Join the next-generation remittance infrastructure — fast, borderless, compliant, and scalable for both VAT refunds and global payroll."
              }
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8 mb-12">
              <div className="bg-neutral-50 rounded-xl p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                  <Clock size={24} className="text-green-700" />
                </div>
                <h3 className="font-['Montserrat'] text-[18px] font-[700] text-brand-900 mb-2">
                  Save Time
                </h3>
                <p className="text-subtext-color text-sm">
                  Near-instant transactions with 4-second finality
                </p>
              </div>

              <div className="bg-neutral-50 rounded-xl p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                  <DollarSign size={24} className="text-green-700" />
                </div>
                <h3 className="font-['Montserrat'] text-[18px] font-[700] text-brand-900 mb-2">
                  Save Money
                </h3>
                <p className="text-subtext-color text-sm">
                  Up to 95% lower fees than traditional banking
                </p>
              </div>

              <div className="bg-neutral-50 rounded-xl p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                  <Shield size={24} className="text-green-700" />
                </div>
                <h3 className="font-['Montserrat'] text-[18px] font-[700] text-brand-900 mb-2">
                  Stay Compliant
                </h3>
                <p className="text-subtext-color text-sm">
                  AI-powered compliance across jurisdictions
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <ConnectButton />

            <span className="text-subtext-color">or</span>

            <Button
              size="large"
              variant="neutral-secondary"
              onClick={() => window.open("https://docs.Zarfa.com", "_blank")}
              icon={<ArrowRight size={20} />}
              className="px-10 py-6 hover:bg-brand-50 transition-all duration-300 text-lg"
            >
              Read Documentation
            </Button>
          </div>

          <div className="mt-12 flex items-center gap-2 text-subtext-color">
            <Shield size={16} />
            <span className="text-sm">
              Enterprise-grade security with multi-sig treasury and oracle
              verification
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex w-full flex-col items-start">
        <EnhancedFooter />
      </div>
    </div>
  );
}

export default AptosLandingPage;

