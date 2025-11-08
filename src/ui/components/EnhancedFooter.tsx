"use client";

import React from "react";
import * as SubframeUtils from "../utils";
import { LinkButton } from "./LinkButton";
import { IconButton } from "./IconButton";
import {
  Twitter,
  Github,
  Linkedin,
  Wallet,
  Mail,
  Globe,
  Shield,
  Clock,
  DollarSign,
  Bot,
} from "lucide-react";

interface EnhancedFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const EnhancedFooter = React.forwardRef<HTMLElement, EnhancedFooterProps>(
  function EnhancedFooter(
    { className, ...otherProps }: EnhancedFooterProps,
    ref
  ) {
    return (
      <footer
        className={SubframeUtils.twClassNames(
          "w-full bg-neutral-900 text-white",
          className
        )}
        ref={ref as any}
        {...otherProps}
      >
        {/* Top Footer Section with Newsletter */}

        {/* Main Footer Content */}
        <div className="max-w-[1280px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center">
                  <Wallet size={20} className="text-white" />
                </div>
                <span className="font-['Montserrat'] text-[24px] font-[800] text-white">
                  Zarfa
                </span>
              </div>

              <p className="text-white/70 mb-6 text-sm">
                Borderless payments infrastructure built on Aptos blockchain
                unifying VAT refunds and global payroll automation with
                AI-driven financial intelligence.
              </p>

              <div className="flex items-center gap-4 mb-8">
                <IconButton
                  icon={<Twitter />}
                  className="bg-neutral-800 hover:bg-brand-800 transition-colors"
                />
                <IconButton
                  icon={<Github />}
                  className="bg-neutral-800 hover:bg-brand-800 transition-colors"
                />
                <IconButton
                  icon={<Linkedin />}
                  className="bg-neutral-800 hover:bg-brand-800 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Shield size={14} />
                <span>Enterprise-grade security</span>
              </div>
            </div>

            {/* Links Sections */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="font-['Montserrat'] text-[16px] font-[700] mb-6 text-white">
                Solutions
              </h4>
              <div className="flex flex-col gap-3">
                <LinkButton className="text-white/70 hover:text-white">
                  VAT Refunds
                </LinkButton>
                <LinkButton className="text-white/70 hover:text-white">
                  Global Payroll
                </LinkButton>
                <LinkButton className="text-white/70 hover:text-white">
                  Enterprise
                </LinkButton>
                <LinkButton className="text-white/70 hover:text-white">
                  Compliance
                </LinkButton>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <h4 className="font-['Montserrat'] text-[16px] font-[700] mb-6 text-white">
                Company
              </h4>
              <div className="flex flex-col gap-3">
                <LinkButton className="text-white/70 hover:text-white">
                  About
                </LinkButton>
                <LinkButton className="text-white/70 hover:text-white">
                  Careers
                </LinkButton>
                <LinkButton className="text-white/70 hover:text-white">
                  Blog
                </LinkButton>
                <LinkButton className="text-white/70 hover:text-white">
                  Press
                </LinkButton>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <h4 className="font-['Montserrat'] text-[16px] font-[700] mb-6 text-white">
                Resources
              </h4>
              <div className="flex flex-col gap-3">
                <LinkButton className="text-white/70 hover:text-white">
                  Documentation
                </LinkButton>
                <LinkButton className="text-white/70 hover:text-white">
                  API Reference
                </LinkButton>
                <LinkButton className="text-white/70 hover:text-white">
                  Help Center
                </LinkButton>
                <LinkButton className="text-white/70 hover:text-white">
                  Community
                </LinkButton>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <h4 className="font-['Montserrat'] text-[16px] font-[700] mb-6 text-white">
                Contact
              </h4>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-white/70" />
                  <LinkButton className="text-white/70 hover:text-white">
                    hello@Zarfa.com
                  </LinkButton>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-white/70" />
                  <LinkButton className="text-white/70 hover:text-white">
                    Zarfa.com
                  </LinkButton>
                </div>
              </div>
            </div>
          </div>

          {/* Features Highlight */}
          <div className="mt-16 pt-12 border-t border-neutral-800">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-brand-600" />
                <span className="text-white/80 text-sm">4-Second Finality</span>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign size={20} className="text-brand-600" />
                <span className="text-white/80 text-sm">
                  Ultra-Low Transaction Fees
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Bot size={20} className="text-brand-600" />
                <span className="text-white/80 text-sm">
                  AI-Driven Intelligence
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Globe size={20} className="text-brand-600" />
                <span className="text-white/80 text-sm">
                  Global Coverage (190+ Countries)
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-16 pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <span className="text-white/60 text-sm">
                © Zarfa {new Date().getFullYear()}
              </span>
              <div className="flex gap-6">
                <LinkButton className="text-white/60 hover:text-white text-sm">
                  Privacy Policy
                </LinkButton>
                <LinkButton className="text-white/60 hover:text-white text-sm">
                  Terms of Service
                </LinkButton>
                <LinkButton className="text-white/60 hover:text-white text-sm">
                  Cookies
                </LinkButton>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">Powered by</span>
              <img
                src="/Aptos_mark_WHT.svg"
                alt="Aptos logo"
                className="h-5 object-contain"
              />
            </div>
          </div>
        </div>
      </footer>
    );
  }
);

export default EnhancedFooter;
