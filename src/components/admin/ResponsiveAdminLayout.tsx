import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ADMIN_SECTIONS, type AdminSection } from './PizzeriaAdminPanel';
import { cn } from '@/lib/utils';

interface CategoryGroup {
  category: AdminSection['category'];
  label: string;
  emoji: string;
  color: string;
  sections: AdminSection[];
}

interface ResponsiveAdminLayoutProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children?: React.ReactNode;
}

const ResponsiveAdminLayout: React.FC<ResponsiveAdminLayoutProps> = ({
  activeTab,
  onTabChange,
  children
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['core', 'operations'])
  );

  // Group sections by category
  const categoryGroups: CategoryGroup[] = [
    {
      category: 'core' as const,
      label: 'Gestione Principale',
      emoji: '🏪',
      color: 'bg-red-500',
      sections: ADMIN_SECTIONS.filter(s => s.category === 'core')
    },
    {
      category: 'operations' as const,
      label: 'Operazioni Business',
      emoji: '⚙️',
      color: 'bg-orange-500',
      sections: ADMIN_SECTIONS.filter(s => s.category === 'operations')
    },
    {
      category: 'content' as const,
      label: 'Gestione Contenuti',
      emoji: '📝',
      color: 'bg-blue-500',
      sections: ADMIN_SECTIONS.filter(s => s.category === 'content')
    },
    {
      category: 'interaction' as const,
      label: 'Interazione Clienti',
      emoji: '👥',
      color: 'bg-green-500',
      sections: ADMIN_SECTIONS.filter(s => s.category === 'interaction')
    },
    {
      category: 'testing' as const,
      label: 'Test e Diagnostica',
      emoji: '🧪',
      color: 'bg-purple-500',
      sections: ADMIN_SECTIONS.filter(s => s.category === 'testing')
    },
    {
      category: 'system' as const,
      label: 'Impostazioni Sistema',
      emoji: '🔧',
      color: 'bg-gray-500',
      sections: ADMIN_SECTIONS.filter(s => s.category === 'system')
    },
    {
      category: 'advanced' as const,
      label: 'Strumenti Avanzati',
      emoji: '⚡',
      color: 'bg-indigo-500',
      sections: ADMIN_SECTIONS.filter(s => s.category === 'advanced')
    },
  ].filter(group => group.sections.length > 0);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className="lg:hidden flex flex-col h-full">
      {/* Quick Actions Grid */}
      <div className="p-4 bg-gradient-to-br from-gray-50 to-white border-b">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center">
            <span className="w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
            Azioni Rapide
          </h3>
          <p className="text-xs text-gray-500">Accesso veloce alle sezioni</p>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {ADMIN_SECTIONS.slice(0, 9).map((section) => {
            const Icon = section.icon;
            const isActive = activeTab === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => onTabChange(section.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl transition-all border-2",
                  isActive
                    ? "bg-blue-50 border-blue-500 shadow-md"
                    : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center mb-1.5",
                  isActive ? "bg-blue-500" : "bg-gray-100"
                )}>
                  <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-600")} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium text-center leading-tight line-clamp-2",
                  isActive ? "text-blue-700" : "text-gray-700"
                )}>
                  {section.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Accordion */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-gray-800 flex items-center">
              <span className="w-1 h-4 bg-purple-500 rounded-full mr-2"></span>
              Tutte le Sezioni
            </h3>
            <p className="text-xs text-gray-500">{ADMIN_SECTIONS.length} sezioni disponibili</p>
          </div>

          {categoryGroups.map((group) => {
            const isExpanded = expandedCategories.has(group.category);
            
            return (
              <div key={group.category} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() => toggleCategory(group.category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", group.color)}>
                      <span className="text-white text-lg">{group.emoji}</span>
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-sm text-gray-800">{group.label}</h4>
                      <p className="text-xs text-gray-500">{group.sections.length} sezioni</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    {group.sections
                      .sort((a, b) => a.priority - b.priority)
                      .map((section) => {
                        const Icon = section.icon;
                        const isActive = activeTab === section.id;
                        
                        return (
                          <button
                            key={section.id}
                            onClick={() => onTabChange(section.id)}
                            className={cn(
                              "w-full flex items-center p-3 hover:bg-white transition-colors border-l-4",
                              isActive
                                ? "bg-blue-50 border-blue-500"
                                : "bg-transparent border-transparent"
                            )}
                          >
                            <div className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center mr-3 flex-shrink-0",
                              isActive ? "bg-blue-500" : "bg-white"
                            )}>
                              <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-gray-600")} />
                            </div>
                            <div className="flex-1 text-left">
                              <div className={cn(
                                "text-sm font-medium",
                                isActive ? "text-blue-700" : "text-gray-800"
                              )}>
                                {section.label}
                              </div>
                              <div className="text-xs text-gray-500 line-clamp-1">
                                {section.description}
                              </div>
                            </div>
                            {isActive && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 ml-2 animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      {children && (
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
};

export default ResponsiveAdminLayout;
