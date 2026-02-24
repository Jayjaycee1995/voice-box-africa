import { ElementType } from "react";

interface Tab {
  id: string;
  label: string;
  icon: ElementType;
  badge?: number;
}

interface MobileBottomNavProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

/**
 * Shared mobile bottom navigation bar used by both ClientDashboard and TalentDashboard.
 * Hidden on lg+ screens where the sidebar takes over.
 */
const MobileBottomNav = ({ tabs, activeTab, onTabChange }: MobileBottomNavProps) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex items-center justify-around px-2 py-1 safe-area-pb">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-all min-w-0 flex-1 ${
            activeTab === tab.id
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        >
          <div className="relative">
            <tab.icon className="w-5 h-5" />
            {tab.badge !== undefined && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-[10px] font-bold">
                {tab.badge}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium truncate w-full text-center leading-tight">
            {tab.label}
          </span>
          {activeTab === tab.id && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
