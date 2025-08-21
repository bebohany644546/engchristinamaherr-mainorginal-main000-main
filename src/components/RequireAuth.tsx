
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface RequireAuthProps {
  children: JSX.Element;
  allowedRoles?: ("admin" | "student" | "parent")[];
}

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { currentUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) {
      console.log("No authenticated user found");
    } else if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      console.log(`User role ${currentUser.role} not allowed`);
    }
  }, [currentUser, allowedRoles]);

  if (!currentUser) {
    // Redirect to login page if not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to unauthorized page if user doesn't have required role
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
}
