
import React, { useState } from 'react';

interface TabsProps {
  tabs: { label: string; content: React.ReactNode }[];
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="border-b border-border">
        <div className="overflow-x-auto">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map((tab, index) => (
                <button
                key={tab.label}
                onClick={() => setActiveTab(index)}
                className={`${
                    activeTab === index
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                } whitespace-nowrap py-4 px-3 border-b-2 font-bold text-sm transition-colors focus:outline-none`}
                >
                {tab.label}
                </button>
            ))}
            </nav>
        </div>
      </div>
      <div className="mt-6">{tabs[activeTab].content}</div>
    </div>
  );
};

export default Tabs;
