import React from "react";
import { useEffect, useState, type JSX } from "react";
import { Navigate } from "react-router-dom";

export function AdminRoute({ children }: { children: JSX.Element }) {
  const [allowed, setAllowed] = useState<null | boolean>(null);
  const [user, setUser] = React.useState<{ id: string; role: string } | null>(null);
  const isAdmin = user?.role === "admin";
if (!isAdmin) {
    return <Navigate to="/Home" />;
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/login/me", { credentials: "include" });
        if (!res.ok) return setAllowed(false);

        const me = await res.json();
        setAllowed(me.role === "admin");
      } catch {
        setAllowed(false);
      }
    })();
  }, []);

  if (allowed === null) return null;            
  if (!allowed) return <Navigate to="/login" />; 

  return children;
}
