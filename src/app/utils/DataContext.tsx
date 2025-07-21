"use client";
import React, { createContext, ReactNode } from "react";
import { TagItem } from "@/app/components/types";

export const DataContext = createContext<TagItem[]>([]);

export function DataProvider({ children, data }: { children: ReactNode; data: TagItem[] }) {
  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}
