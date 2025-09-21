import React from "react";
import { installGlobalErrorLogger, log } from "../../lib/logging/logger";
installGlobalErrorLogger();
type Props = { children: React.ReactNode };
type State = { hasError: boolean; message?: string };
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: Error): State { return { hasError: true, message: error?.message ?? "Unbekannter Fehler" }; }
  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { await log("error", error.message, { componentStack: errorInfo?.componentStack ?? null }, (error as any).stack); }
  render() {
    if (this.state.hasError) {
      return (<div className="p-6 flex flex-col items-center gap-3">
        <h1 className="text-xl font-semibold">Etwas ist schiefgelaufen</h1>
        <p className="opacity-80">{this.state.message}</p>
        <button className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800" onClick={() => { this.setState({ hasError: false, message: undefined }); if ("scrollRestoration" in window.history) { window.location.replace(window.location.href); } else { window.location.href = window.location.href; } }}>Neu laden</button>
      </div>);
    }
    return this.props.children;
  }
}
