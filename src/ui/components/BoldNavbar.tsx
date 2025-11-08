"use client";
/*
 * Documentation:
 * Bold navbar — https://app.subframe.com/efa3f2e9269c/library?component=Bold+navbar_8be1b160-02db-4f5b-b7d6-f3c2c8ede9d6
 * Link Button — https://app.subframe.com/efa3f2e9269c/library?component=Link+Button_a4ee726a-774c-4091-8c49-55b659356024
 * Button — https://app.subframe.com/efa3f2e9269c/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { LinkButton } from "./LinkButton";
import { Button } from "./Button";
import { Wallet } from "lucide-react";

interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const NavItem = React.forwardRef<HTMLElement, NavItemProps>(function NavItem(
  { children, selected = false, onClick, className, ...otherProps }: NavItemProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/b8f2fb75 flex h-8 cursor-pointer flex-col items-center justify-center gap-4 rounded-full px-4",
        { "bg-brand-200": selected },
        className
      )}
      onClick={onClick}
      ref={ref as any}
      {...otherProps}
    >
      {children ? (
        <span className="font-['Montserrat'] text-[15px] font-[600] leading-[20px] text-brand-900">
          {children}
        </span>
      ) : null}
    </div>
  );
});

interface BoldNavbarRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  onGetStarted?: () => void;
}

const BoldNavbarRoot = React.forwardRef<HTMLElement, BoldNavbarRootProps>(
  function BoldNavbarRoot(
    { className, onGetStarted, ...otherProps }: BoldNavbarRootProps,
    ref
  ) {
    const scrollToSection = (sectionId: string) => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    };

    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full max-w-[1280px] flex-wrap items-center gap-4",
          className
        )}
        ref={ref as any}
        {...otherProps}
      >
        
       
     
        
      </div>
    );
  }
);

export const BoldNavbar = Object.assign(BoldNavbarRoot, {
  NavItem,
});

  