"use client";
import React from "react";
import NostrProvider from "./context/NostrContext";
import Nav from "./components/nav";

export default function ParentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NostrProvider>
      <nav>
        <Nav />
      </nav>
      {children}
    </NostrProvider>
  );
}
