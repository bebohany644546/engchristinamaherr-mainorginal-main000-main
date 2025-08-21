import React from "react";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  variant?: "primary" | "secondary" | "danger" | "success" | "warning";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon: Icon,
  label,
  variant = "primary",
  size = "md",
  disabled = false,
  className = ""
}) => {
  const baseClasses = "flex items-center gap-2 font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-physics-gold to-yellow-500 text-physics-dark hover:from-yellow-500 hover:to-physics-gold",
    secondary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800",
    danger: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800",
    success: "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800",
    warning: "bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20
  };

  const disabledClasses = disabled 
    ? "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100" 
    : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabledClasses}
        ${className}
      `}
    >
      <Icon size={iconSizes[size]} />
      <span>{label}</span>
    </button>
  );
};

export default ActionButton;
