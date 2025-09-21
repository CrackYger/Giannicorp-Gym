import React from "react";
export const SafeAreaTop: React.FC<{ className?: string }> = ({ className }) => (<div className={["safe-area-top", className ?? ""].join(" ")} />);
export const SafeAreaBottom: React.FC<{ className?: string }> = ({ className }) => (<div className={["safe-area-bottom", className ?? ""].join(" ")} />);
