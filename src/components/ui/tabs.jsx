// src/components/ui/tabs.jsx
import React from "react";

const Tabs = ({ children, defaultValue, className = "", ...props }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
};

const TabsList = ({ children, className = "", activeTab, setActiveTab }) => {
  return (
    <div className={`flex space-x-2 border-b ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
};

const TabsTrigger = ({
  value,
  children,
  activeTab,
  setActiveTab,
  className = "",
}) => {
  return (
    <button
      className={`px-4 py-2 ${
        activeTab === value
          ? "border-b-2 border-blue-500 text-blue-600"
          : "text-gray-600 hover:text-gray-800"
      } ${className}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, activeTab, className = "" }) => {
  if (activeTab !== value) return null;
  return <div className={className}>{children}</div>;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
