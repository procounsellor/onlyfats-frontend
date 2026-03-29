import { Bell, Home, LogOut, Menu, MessageCircle, PlusSquare, Search, Settings, User } from "lucide-react";
import Brand from "../common/Brand";

const items = [
  { key: "feed", label: "Home", icon: Home },
  { key: "discover", label: "Discover", icon: Search },
  { key: "messages", label: "Messages", icon: MessageCircle },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "create", label: "Create", icon: PlusSquare },
  { key: "profile", label: "Profile", icon: User },
  { key: "settings", label: "Settings", icon: Settings },
];

function SidebarContent({ currentTab, setCurrentTab, setMobileOpen, onLogout }) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <Brand />
        <nav className="mt-8 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setCurrentTab(item.key);
                  setMobileOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                  active ? "bg-white text-black shadow-lg" : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <button
        onClick={onLogout}
        className="flex items-center gap-3 rounded-2xl border border-zinc-800 px-4 py-3 text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </button>
    </div>
  );
}

export default function Sidebar({ currentTab, setCurrentTab, mobileOpen, setMobileOpen, onLogout }) {
  return (
    <>
      <aside className="hidden w-[280px] shrink-0 border-r border-zinc-900 bg-black/80 p-6 lg:block">
        <SidebarContent
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          setMobileOpen={setMobileOpen}
          onLogout={onLogout}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-[320px] border-r border-zinc-900 bg-black p-6">
            <SidebarContent
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              setMobileOpen={setMobileOpen}
              onLogout={onLogout}
            />
          </div>
        </div>
      )}
    </>
  );
}