"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Images, PanelLeft, User, } from "lucide-react";
import { HomeIcon, HomeFilledIcon, HeartIcon, HeartFilledIcon } from "./icons";
import { cn } from "@/lib/utils";

interface NavItem {
  type: "custom" | "lucide";
  icon?: React.ComponentType<{ color?: string; size?: number }>;
  iconFilled?: React.ComponentType<{ color?: string; size?: number }>;
  lucideIcon?: React.ElementType;
  href: string;
}

const navItems: NavItem[] = [
  {
    type: "custom",
    icon: HomeIcon,
    iconFilled: HomeFilledIcon,
    href: "/",
  },
  {
    type: "lucide",
    lucideIcon: PanelLeft,
    href: "/memories",
  },
  {
    type: "custom",
    icon: HeartIcon,
    iconFilled: HeartFilledIcon,
    href: "/community",
  },
  {
    type: "lucide",
    lucideIcon: User,
    href: "/profile",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border rounded-t-xl bg-background"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
      }}
    >
      <div className="mx-auto max-w-lg">
        <div className="grid grid-cols-4">
          
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center py-4 transition-opacity active:opacity-40"
              >
                {item.type === "custom" && item.icon && item.iconFilled ? (
                  <>
                    {isActive ? (
                      <item.iconFilled color="currentColor" size={26} />
                    ) : (
                      <item.icon color="#999999" size={26} />
                    )}
                  </>
                ) : item.type === "lucide" && item.lucideIcon ? (
                  <item.lucideIcon
                    className={cn(isActive ? "text-foreground" : "text-[#999999]")}
                    size={26}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

