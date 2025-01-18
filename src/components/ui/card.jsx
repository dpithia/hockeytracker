import React from "react";

export const Card = ({ className = "", children, ...props }) => {
  return (
    <div
      className={`bg-white shadow-md rounded-lg overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className = "", ...props }) => {
  return <div className={`px-6 py-4 border-b ${className}`} {...props} />;
};

export const CardTitle = ({ className = "", ...props }) => {
  return <h3 className={`text-xl font-semibold ${className}`} {...props} />;
};

export const CardContent = ({ className = "", ...props }) => {
  return <div className={`px-6 py-4 ${className}`} {...props} />;
};

// src/components/ui/tabs.jsx
export const Tabs = ({ children, defaultValue, className = "", ...props }) => {
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

export const TabsList = ({
  children,
  className = "",
  activeTab,
  setActiveTab,
}) => {
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

export const TabsTrigger = ({
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

export const TabsContent = ({ value, children, activeTab, className = "" }) => {
  if (activeTab !== value) return null;
  return <div className={className}>{children}</div>;
};
