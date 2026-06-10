import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import {
  LayoutDashboard,
  PlusCircle,
  Wallet,
  Tags,
  PiggyBank,
  BarChart3,
  Users,
  LogOut,
  ChevronsRight } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import BrandWordmark from "@/components/BrandWordmark";
import { DemoModeProvider } from "@/components/DemoModeContext";

const navigationItems = [
{
  title: "דשבורד",
  url: createPageUrl("Dashboard"),
  icon: LayoutDashboard
},
{
  title: "ביצוע מעקב",
  url: createPageUrl("AddTransaction"),
  icon: PlusCircle
},
{
  title: "ניהול מקורות",
  url: createPageUrl("Sources"),
  icon: Wallet
},
{
  title: "מנהל הקטגוריות",
  url: createPageUrl("Categories"),
  icon: Tags
},
{
  title: "מנהל התקציבים",
  url: createPageUrl("Budgets"),
  icon: PiggyBank
},
{
  title: "דוחות תקופתיים",
  url: createPageUrl("Reports"),
  icon: BarChart3
}];

const adminNavigationItems = [
{
  title: "משתמשים ושימושים",
  url: createPageUrl("AdminUsers"),
  icon: Users
}];



export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await User.logout();
    window.location.reload();
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>);

  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center" dir="rtl">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-4">trackRega</h1>
          <p className="text-gray-300 mb-6">נהל את הכספים שלך בצורה חכמה ויעילה</p>
          <Button
            onClick={() => User.login()}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8 py-3 rounded-xl">

            התחבר עכשיו
          </Button>
        </div>
      </div>);

  }

  const allNavItems = user?.role === 'admin'
    ? [...navigationItems, ...adminNavigationItems]
    : navigationItems;

  return (
    <DemoModeProvider>
      <TooltipProvider delayDuration={0}>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-[#0F172A] via-slate-900 to-[#12343B]" dir="rtl">
          <aside
            className={`
              flex flex-col bg-[#0F172A]/85 backdrop-blur-xl border-r border-[#2DD4BF]/20 
              transition-all duration-300 ease-in-out
              ${isSidebarCollapsed ? 'w-20' : 'w-72'}
            `}>

            <div className="border-b border-[#2DD4BF]/20 p-4 h-[73px] flex items-center justify-between">
              {!isSidebarCollapsed &&
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSidebar}
                className="bg-transparent border-[#2DD4BF]/50 text-[#2DD4BF] hover:bg-[#2DD4BF]/10 hover:border-[#2DD4BF] hover:text-white">

                  <ChevronsRight className="w-5 h-5" />
                </Button>
              }
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => isSidebarCollapsed && toggleSidebar()}>

                <div className={`text-right overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0' : 'w-auto mr-3'}`}>
                  <BrandWordmark showTagline={false} />
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <div className="w-full h-full rounded-xl border border-[#2DD4BF]/50 bg-[#0F172A] flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-[#F59E0B]" />
                  </div>
                </div>
              </div>
            </div>
            
            <nav className="flex-1 flex flex-col px-3 py-4">
              <div className="space-y-2">
                {allNavItems.map((item) =>
                <Tooltip key={item.title}>
                    <TooltipTrigger asChild>
                      <Link
                      to={item.url}
                      className={`
                          flex items-center gap-4 p-3 rounded-xl transition-colors duration-200
                          ${location.pathname.startsWith(item.url) ?
                      'bg-[#2DD4BF]/15 text-[#2DD4BF] font-bold border border-[#2DD4BF]/40' :
                      'text-[#CBD5E1] hover:bg-[#2DD4BF]/10 hover:text-white'}
                          ${isSidebarCollapsed ? 'justify-center' : ''}
                        `}>

                        <item.icon className="w-6 h-6 shrink-0" />
                        <span className={`transition-opacity duration-200 ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{item.title}</span>
                      </Link>
                    </TooltipTrigger>
                    {isSidebarCollapsed &&
                  <TooltipContent side="right" className="bg-[#0F172A] text-white border-[#2DD4BF]/40">
                        <p>{item.title}</p>
                      </TooltipContent>
                  }
                  </Tooltip>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-[#2DD4BF]/20">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogout}
                      className={`
                        w-full flex items-center gap-4 p-3 rounded-xl transition-colors duration-200
                        text-[#CBD5E1] hover:bg-red-900/30 hover:text-red-400
                        ${isSidebarCollapsed ? 'justify-center' : ''}
                      `}>

                      <LogOut className="w-6 h-6 shrink-0" />
                      <span className={`transition-opacity duration-200 ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>התנתק</span>
                    </button>
                  </TooltipTrigger>
                  {isSidebarCollapsed &&
                  <TooltipContent side="right" className="bg-[#0F172A] text-white border-[#2DD4BF]/40">
                      <p>התנתק</p>
                    </TooltipContent>
                  }
                </Tooltip>
              </div>
            </nav>

            <div className="border-t border-[#2DD4BF]/20 p-4">
               <div className="flex items-center gap-3">
                <div className={`text-right overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0' : 'w-auto'}`}>
                    <p className="font-medium text-white text-sm truncate whitespace-nowrap">{user.full_name}</p>
                    <p className="text-xs text-[#2DD4BF] truncate whitespace-nowrap">{user.email}</p>
                </div>
                <Avatar className={`w-10 h-10 border-2 border-[#2DD4BF]/50`}>
                    <AvatarImage src={user.picture} />
                    <AvatarFallback className="text-[#0F172A] font-bold bg-[#2DD4BF]">
                      {user.full_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </aside>
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </TooltipProvider>
    </DemoModeProvider>);

}
