"use client";
/*
 * Documentation:
 * Bold footer — https://app.subframe.com/efa3f2e9269c/library?component=Bold+footer_e35cb674-a3fb-4906-9ea1-3241dc9704d3
 * Link Button — https://app.subframe.com/efa3f2e9269c/library?component=Link+Button_a4ee726a-774c-4091-8c49-55b659356024
 * Icon Button — https://app.subframe.com/efa3f2e9269c/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { LinkButton } from "./LinkButton";
import { IconButton } from "./IconButton";
import { Twitter, Github, Linkedin, Wallet } from "lucide-react";

interface BoldFooterRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const BoldFooterRoot = React.forwardRef<HTMLElement, BoldFooterRootProps>(
  function BoldFooterRoot(
    { className, ...otherProps }: BoldFooterRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col items-center justify-center gap-6 border-t border-solid border-neutral-100 px-6 py-24",
          className
        )}
        ref={ref as any}
        {...otherProps}
      >
        <div className="flex w-full max-w-[1280px] flex-col items-center gap-12">
          <div className="flex w-full flex-wrap items-start gap-6">
            <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-6">
              <span className="w-full font-['Montserrat'] text-[14px] font-[600] leading-[20px] text-default-font -tracking-[0.01em]">
                Product
              </span>
              <div className="flex flex-col items-start gap-4">
                <LinkButton>Features</LinkButton>
                <LinkButton>Security</LinkButton>
                <LinkButton>Blockchain</LinkButton>
              </div>
            </div>
            <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-6">
              <span className="w-full font-['Montserrat'] text-[14px] font-[600] leading-[20px] text-default-font -tracking-[0.01em]">
                Company
              </span>
              <div className="flex flex-col items-start gap-4">
                <LinkButton>About</LinkButton>
                <LinkButton>Blog</LinkButton>
                <LinkButton>Careers</LinkButton>
              </div>
            </div>
            <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-6">
              <span className="w-full font-['Montserrat'] text-[14px] font-[600] leading-[20px] text-default-font -tracking-[0.01em]">
                Resources
              </span>
              <div className="flex flex-col items-start gap-4">
                <LinkButton>Documentation</LinkButton>
                <LinkButton>Help Center</LinkButton>
                <LinkButton>API Reference</LinkButton>
              </div>
            </div>
            <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-4 self-stretch">
              <span className="w-full font-['Montserrat'] text-[14px] font-[600] leading-[20px] text-default-font -tracking-[0.01em]">
                Follow us
              </span>
              <div className="flex w-full items-center gap-2">
                <IconButton icon={<Twitter />} />
                <IconButton icon={<Github />} />
                <IconButton icon={<Linkedin />} />
              </div>
            </div>
          </div>
          <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-200" />

          <div className="flex w-full max-w-[768px] flex-col items-center gap-4">
            <span className="font-['Montserrat'] text-[14px] font-[500] leading-[20px] text-subtext-color text-center">
              © Zarfa 2025
            </span>
            <span className="font-['Montserrat'] text-[14px] font-[500] leading-[20px] text-subtext-color text-center">
              Revolutionary AI-powered payroll solution built on Aptos
              blockchain.
            </span>
          </div>
        </div>
      </div>
    );
  }
);

export const BoldFooter = BoldFooterRoot;
