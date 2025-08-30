import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
} from "lucide-react";

// Dummy menu items
const primaryItems = [
  { title: "Home", url: "#", icon: Home },
  { title: "Inbox", url: "#", icon: Inbox },
];

const secondaryItems = [
  { title: "Calendar", url: "#", icon: Calendar },
  { title: "Search", url: "#", icon: Search },
  { title: "Settings", url: "#", icon: Settings },
];

export function AppSidebar() {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(true);
      else setIsOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Toggle button for mobile/tablet */}
      <div className="lg:hidden flex items-center p-2 fixed top-4 left-4 z-50">
        <button
          className="bg-blue-600 text-white p-2 rounded-lg shadow-lg focus:outline-none"
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? "Close" : "Menu"}
        </button>
      </div>
      {/* Overlay for mobile sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-200 ${isOpen ? "block opacity-100" : "hidden opacity-0"} lg:hidden`}
        onClick={() => setIsOpen(false)}
      ></div>
      {/* Sidebar Drawer (mobile/tablet) */}
      <aside
        className={`fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-lg z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:hidden flex flex-col pt-16`}
      >
        <Sidebar className="h-full">
          <SidebarHeader>
            <h2 className="text-xl font-semibold px-4 py-2">Dashboard</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Primary</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {primaryItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url} className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>More Options</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {secondaryItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url} className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="text-sm text-center text-gray-500 py-4">
              2025 YourApp
            </div>
          </SidebarFooter>
        </Sidebar>
      </aside>

      {/* Sidebar for desktop */}
      <div className="hidden lg:block">
        <Sidebar className="mt-27.5">
          <SidebarHeader>
            <h2 className="text-xl font-semibold px-4 py-2">Dashboard</h2>
          </SidebarHeader>
          <SidebarContent>
            {/* First Group */}
            <SidebarGroup>
              <SidebarGroupLabel>Primary</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {primaryItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url} className="flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {/* Second Group */}
            <SidebarGroup>
              <SidebarGroupLabel>More Options</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {secondaryItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url} className="flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="text-sm text-center text-gray-500 py-4">
              2025 YourApp
            </div>
          </SidebarFooter>
        </Sidebar>
      </div>
    </>
  );
}
