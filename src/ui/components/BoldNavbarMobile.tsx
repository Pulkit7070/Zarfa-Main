"use client";
/*
 * Documentation:
 * Bold navbar mobile — https://app.subframe.com/efa3f2e9269c/library?component=Bold+navbar+mobile_f905f6bd-ab80-464d-a940-fcb91b9ddf42
 * Button — https://app.subframe.com/efa3f2e9269c/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * Icon Button — https://app.subframe.com/efa3f2e9269c/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import * as SubframeCore from "@subframe/core";
import { IconButton } from "./IconButton";
import { Menu, Wallet } from "lucide-react";

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
        "group/0a1c836c flex h-8 cursor-pointer flex-col items-center justify-center gap-4 rounded-full px-4",
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

interface BoldNavbarMobileRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  onGetStarted?: () => void;
}

const BoldNavbarMobileRoot = React.forwardRef<
  HTMLElement,
  BoldNavbarMobileRootProps
>(function BoldNavbarMobileRoot(
  { className, onGetStarted, ...otherProps }: BoldNavbarMobileRootProps,
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
        "flex w-full max-w-[1280px] flex-wrap items-center justify-between",
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      <div className="flex h-12 flex-col items-start justify-center gap-2 px-4">
       
      </div>
     
    </div>
  );
});

export const BoldNavbarMobile = Object.assign(BoldNavbarMobileRoot, {
  NavItem,
});