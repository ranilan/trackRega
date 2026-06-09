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
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
        <div className="min-h-screen flex w-full bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900" dir="rtl">
          <aside
            className={`
              flex flex-col bg-emerald-950/50 backdrop-blur-xl border-r border-emerald-800/30 
              transition-all duration-300 ease-in-out
              ${isSidebarCollapsed ? 'w-20' : 'w-72'}
            `}>

            <div className="border-b border-emerald-800/30 p-4 h-[73px] flex items-center justify-between">
              {!isSidebarCollapsed &&
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSidebar}
                className="bg-transparent border-emerald-700 text-emerald-300 hover:bg-emerald-800/50 hover:border-emerald-600 hover:text-white">

                  <ChevronsRight className="w-5 h-5" />
                </Button>
              }
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => isSidebarCollapsed && toggleSidebar()}>

                <div className={`text-right overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0' : 'w-auto mr-3'}`}>
                  <h2 className="font-bold text-white text-lg whitespace-nowrap"></h2>
                  <p className="text-xs text-emerald-300 whitespace-nowrap"></p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-emerald-950" />
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
                      'bg-emerald-600/30 text-emerald-400 font-bold border border-emerald-600/50' :
                      'text-emerald-200 hover:bg-emerald-800/30 hover:text-white'}
                          ${isSidebarCollapsed ? 'justify-center' : ''}
                        `}>

                        <item.icon className="w-6 h-6 shrink-0" />
                        <span className={`transition-opacity duration-200 ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{item.title}</span>
                      </Link>
                    </TooltipTrigger>
                    {isSidebarCollapsed &&
                  <TooltipContent side="right" className="bg-emerald-900 text-white border-emerald-700">
                        <p>{item.title}</p>
                      </TooltipContent>
                  }
                  </Tooltip>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-emerald-800/30">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogout}
                      className={`
                        w-full flex items-center gap-4 p-3 rounded-xl transition-colors duration-200
                        text-emerald-200 hover:bg-red-900/30 hover:text-red-400
                        ${isSidebarCollapsed ? 'justify-center' : ''}
                      `}>

                      <LogOut className="w-6 h-6 shrink-0" />
                      <span className={`transition-opacity duration-200 ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>התנתק</span>
                    </button>
                  </TooltipTrigger>
                  {isSidebarCollapsed &&
                  <TooltipContent side="right" className="bg-emerald-900 text-white border-emerald-700">
                      <p>התנתק</p>
                    </TooltipContent>
                  }
                </Tooltip>
              </div>
            </nav>

            <div className="border-t border-emerald-800/30 p-4">
               <div className="flex items-center gap-3">
                <div className={`text-right overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0' : 'w-auto'}`}>
                    <p className="font-medium text-white text-sm truncate whitespace-nowrap">{user.full_name}</p>
                    <p className="text-xs text-emerald-300 truncate whitespace-nowrap">{user.email}</p>
                </div>
                <Avatar className={`w-10 h-10 border-2 border-emerald-500/50`}>
                    <AvatarImage src={user.picture} />
                    <AvatarFallback className="text-emerald-950 font-bold bg-gradient-to-r from-emerald-400 to-emerald-500">
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
