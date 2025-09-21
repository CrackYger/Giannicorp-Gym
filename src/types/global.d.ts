export type UUID = string & { readonly __brand: "uuid" };
export type ISODateTime = string & { readonly __brand: "iso_datetime" };
export type Sidedness = "bilateral" | "unilateral" | "either";
export type Side = "left" | "right" | "both";
export type ViewMode = "front" | "back";
export type SideMode = "both" | "left" | "right";
export interface DeviceInfo { userAgent: string; platform: string; language: string; appVersion: string; vendor: string; screen?: { width: number; height: number; pixelRatio: number }; }
