import {
  HomeIcon,
  LayoutDashboard,
  BookOpen,
  Bot,
  HelpCircle,
  StarIcon,
  SettingsIcon,
  Map,
} from "lucide-react";

type NavLink = {
  label: string;
  path: string;
  Icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
  customClass?: string;
};

export const navLinks: NavLink[] = [
  { label: "Home", path: "/", Icon: HomeIcon },
  {
    label: "Dashboard",
    path: "/dashboard",
    Icon: LayoutDashboard,
    requiresAuth: true,
  },
  { label: "Study Guide", path: "/study-guide", Icon: BookOpen },
  { label: "Canada Map", path: "/map", Icon: Map },
  { label: "Ask AI", path: "/ask-ai", Icon: Bot },
  { label: "FAQ", path: "/faq", Icon: HelpCircle },
  {
    label: "Pricing",
    path: "/pricing",
    Icon: StarIcon,
  },
  {
    label: "Settings",
    path: "/settings",
    Icon: SettingsIcon,
    requiresAuth: true,
  },
];
