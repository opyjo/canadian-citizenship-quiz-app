import {
  HomeIcon,
  LayoutDashboard,
  BookOpen,
  Bot,
  HelpCircle,
  StarIcon,
  SettingsIcon,
  Map,
  FileQuestion,
} from "lucide-react";

type SubLink = {
  label: string;
  path: string;
  description: string;
};

type NavLink = {
  label: string;
  path: string;
  Icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
  customClass?: string;
  subLinks?: SubLink[];
};

export const navLinks: NavLink[] = [
  { label: "Home", path: "/", Icon: HomeIcon },
  {
    label: "Dashboard",
    path: "/dashboard",
    Icon: LayoutDashboard,
    requiresAuth: true,
  },
  {
    label: "Quizzes",
    path: "#",
    Icon: FileQuestion,
    subLinks: [
      {
        label: "Standard Quiz",
        path: "/quiz",
        description: "Test your knowledge with a standard quiz.",
      },
      {
        label: "Practice Quiz",
        path: "/practice",
        description: "Hone your skills with practice questions.",
      },
      {
        label: "Timed Quiz",
        path: "/quiz/timed",
        description: "Challenge yourself against the clock.",
      },
    ],
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
