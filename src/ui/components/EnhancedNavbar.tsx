"use client";

import React, { useState, useEffect } from "react";
import * as SubframeUtils from "../utils";
import { Button } from "./Button";
import { Menu, X, ChevronDown, Wallet } from "lucide-react";
import ConnectButton from "../../utils/connect-wallet";
import ZarfaLogo from "../../components/ZarfaLogo";

interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  hasDropdown?: boolean;
}

const NavItem = React.forwardRef<HTMLElement, NavItemProps>(function NavItem(
  {
    children,
    active = false,
    onClick,
    className,
    hasDropdown = false,
    ...otherProps
  }: NavItemProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group relative flex h-10 cursor-pointer items-center gap-1 px-4 rounded-full transition-all duration-200",
        active ? "bg-brand-50 text-brand-900" : "hover:bg-neutral-50",
        className
      )}
      onClick={onClick}
      ref={ref as any}
      {...otherProps}
    >
      {children ? (
        <span className="font-['Montserrat'] text-[15px] font-[600] leading-[20px]">
          {children}
        </span>
      ) : null}
      {hasDropdown && (
        <ChevronDown
          size={16}
          className="transition-transform group-hover:rotate-180"
        />
      )}
    </div>
  );
});

interface EnhancedNavbarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  transparent?: boolean;
}

const EnhancedNavbar = React.forwardRef<HTMLElement, EnhancedNavbarProps>(
  function EnhancedNavbar(
    { className, transparent = false, ...otherProps }: EnhancedNavbarProps,
    ref
  ) {
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("home");

    useEffect(() => {
      const handleScroll = () => {
        const isScrolled = window.scrollY > 20;
        if (isScrolled !== scrolled) {
          setScrolled(isScrolled);
        }

        // Determine active section based on scroll position
        const sections = ["features", "benefits", "about", "pricing"];
        let currentSection = "home";

        for (const section of sections) {
          const element = document.getElementById(`${section}-section`);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 100) {
              currentSection = section;
            }
          }
        }

        setActiveSection(currentSection);
      };

      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }, [scrolled]);

    const scrollToSection = (sectionId: string) => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        setActiveSection(sectionId.replace("-section", ""));
      }
    };

    return (
      <nav
        id="enhanced-navbar"
        className={SubframeUtils.twClassNames(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "py-2 bg-white/95 backdrop-blur-sm shadow-md"
            : transparent
            ? "py-6 bg-transparent"
            : "py-6 bg-white",
          className
        )}
        ref={ref as any}
        {...otherProps}
      >
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <ZarfaLogo />
            <span className="font-['Montserrat'] text-[20px] font-[800] text-brand-900">
              Zarfa
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavItem
              active={activeSection === "home"}
              onClick={() => scrollToSection("home")}
            >
              Home
            </NavItem>
            <NavItem
              active={activeSection === "features"}
              onClick={() => scrollToSection("features-section")}
              hasDropdown
            >
              Features
            </NavItem>
            <NavItem
              active={activeSection === "benefits"}
              onClick={() => scrollToSection("benefits-section")}
            >
              Benefits
            </NavItem>
            <NavItem
              active={activeSection === "about"}
              onClick={() => scrollToSection("about-section")}
            >
              How It Works
            </NavItem>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <MobileNavbar
            scrollToSection={scrollToSection}
            activeSection={activeSection}
          />
        </div>
      </nav>
    );
  }
);

interface MobileNavbarProps {
  onConnectWallet?: () => void;
  scrollToSection: (sectionId: string) => void;
  activeSection: string;
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({
  onConnectWallet,
  scrollToSection,
  activeSection,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className="p-2 rounded-full hover:bg-neutral-100"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex justify-end p-6">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-neutral-100"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-6 p-6">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <ZarfaLogo className="w-10 h-10" />
              <span className="font-['Montserrat'] text-[24px] font-[800] text-brand-900">
                Zarfa
              </span>
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col items-center gap-4 w-full">
              <NavItem
                active={activeSection === "home"}
                onClick={() => handleNavClick("home")}
                className="w-full justify-center"
              >
                Home
              </NavItem>
              <NavItem
                active={activeSection === "features"}
                onClick={() => handleNavClick("features-section")}
                className="w-full justify-center"
              >
                Features
              </NavItem>
              <NavItem
                active={activeSection === "benefits"}
                onClick={() => handleNavClick("benefits-section")}
                className="w-full justify-center"
              >
                Benefits
              </NavItem>
              <NavItem
                active={activeSection === "about"}
                onClick={() => handleNavClick("about-section")}
                className="w-full justify-center"
              >
                How It Works
              </NavItem>
              <NavItem
                active={activeSection === "pricing"}
                onClick={() => handleNavClick("pricing-section")}
                className="w-full justify-center"
              >
                Pricing
              </NavItem>
            </div>

            {/* CTA Button */}
            <div className="mt-8 w-full">
              <Button
                size="large"
                onClick={() => {
                  if (onConnectWallet) {
                    onConnectWallet();
                    setIsOpen(false);
                  }
                }}
                icon={<Wallet size={20} />}
                className="w-full"
              >
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedNavbar;
