"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Shield, TrendingUp, DollarSign, Clock, Gamepad2 } from "lucide-react";

// 工具列表
const tools = [
  { id: "compound-compare", name: "复利与资产对比", icon: TrendingUp, ready: true },
  { id: "fx-calculator", name: "汇率盈亏计算器", icon: DollarSign, ready: false },
  { id: "wealth-simulator", name: "财富风险模拟器", icon: Gamepad2, ready: false },
  { id: "birthday-calculator", name: "生日回溯计算器", icon: Clock, ready: true },
  { id: "critical-illness", name: "重疾条款对比", icon: Shield, ready: true },
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/planz-logo.svg"
              alt="PlanZ Insurance Tools"
              width={180}
              height={36}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-primary text-foreground/80 hover:text-foreground"
            >
              首页
            </Link>
            {tools.map((tool) => (
              <Link
                key={tool.id}
                href={`/${tool.id}`}
                className={`transition-colors ${
                  tool.ready
                    ? "text-foreground/80 hover:text-foreground hover:text-primary"
                    : "text-muted-foreground cursor-not-allowed"
                }`}
              >
                {tool.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <nav className="px-4 py-4 space-y-3">
            <Link
              href="/"
              className="block py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              首页
            </Link>
            {tools.map((tool) => (
              <Link
                key={tool.id}
                href={`/${tool.id}`}
                className={`block py-2 text-sm font-medium ${
                  tool.ready
                    ? "hover:text-primary"
                    : "text-muted-foreground cursor-not-allowed"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {tool.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
