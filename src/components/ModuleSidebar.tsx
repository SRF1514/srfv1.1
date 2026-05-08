import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Module {
  id: string;
  title: string;
}

interface ModuleSidebarProps {
  modules: Module[];
  currentId: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  basePath: string;
}

export default function ModuleSidebar({ 
  modules, 
  currentId, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  basePath 
}: ModuleSidebarProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpenSidebar = () => setIsSidebarOpen(true);
    window.addEventListener('open-module-sidebar', handleOpenSidebar);
    return () => window.removeEventListener('open-module-sidebar', handleOpenSidebar);
  }, [setIsSidebarOpen]);

  return (
    <>
      {/* Sidebar: Course Progress */}
      <AnimatePresence>
        {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
          <>
            {/* Backdrop for mobile */}
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
              />
            )}
            
            <motion.div 
              initial={typeof window !== 'undefined' && window.innerWidth < 1024 ? { x: '100%' } : false}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`w-full lg:w-auto ${isSidebarOpen ? 'fixed top-0 right-0 h-full w-[280px] bg-white z-[120] shadow-2xl p-6 overflow-y-auto' : 'hidden lg:block'}`}
            >
              <div className="sticky top-32 lg:static">
                <div className={`${!isSidebarOpen ? 'bg-gray-50/50 rounded-2xl p-6 border border-gray-100' : ''}`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-intense-indigo/40">Course Progress</h3>
                    {isSidebarOpen && (
                      <button onClick={() => setIsSidebarOpen(false)} className="text-intense-indigo/40 hover:text-intense-indigo">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {modules.map((m, i) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          navigate(`${basePath}/${m.id}`);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 text-left group transition-colors ${m.id === currentId ? 'text-intense-indigo' : 'text-intense-indigo/40 hover:text-intense-indigo/60'}`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${m.id === currentId ? 'bg-intense-indigo text-white border-intense-indigo shadow-sm' : 'bg-white border-gray-100 group-hover:border-intense-indigo/20'}`}>
                          {i + 1}
                        </div>
                        <span className="text-xs font-bold line-clamp-1">{m.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
