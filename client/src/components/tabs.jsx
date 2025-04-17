import React from "react";
import PropTypes from "prop-types";

// Tabs component to manage the state and provide context to its children
export function Tabs({ children, defaultValue, className }) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  return (
    <div className={`tabs ${className}`}>
      {React.Children.map(children, (child) => {
        if (child.type.displayName === "TabsList") {
          return React.cloneElement(child, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
}

Tabs.propTypes = {
  children: PropTypes.node.isRequired,
  defaultValue: PropTypes.string,
  className: PropTypes.string,
};

Tabs.defaultProps = {
  defaultValue: "",
  className: "",
};

// TabsList component to render the list of tab triggers
export function TabsList({ children, activeTab, setActiveTab, className }) {
  return (
    <div className={`tabs-list flex border-b border-gray-300 ${className}`}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
}

TabsList.propTypes = {
  children: PropTypes.node.isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  className: PropTypes.string,
};

TabsList.defaultProps = {
  className: "",
};

// TabsTrigger component to render individual tab triggers
export function TabsTrigger({
  value,
  children,
  activeTab,
  setActiveTab,
  className,
}) {
  const isActive = value === activeTab;
  return (
    <button
      className={`tabs-trigger px-4 py-2 cursor-pointer focus:outline-none ${
        isActive
          ? "border-b-2 border-indigo-500 text-indigo-500"
          : "border-b-2 border-transparent"
      } ${className}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

TabsTrigger.propTypes = {
  value: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  className: PropTypes.string,
};

TabsTrigger.defaultProps = {
  className: "",
};

Tabs.displayName = "Tabs";
TabsList.displayName = "TabsList";
TabsTrigger.displayName = "TabsTrigger";
