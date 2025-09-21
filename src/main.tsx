import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./app/providers/ThemeProvider";
import { ErrorBoundary } from "./app/providers/ErrorBoundary";
import { LoadingFallback } from "./app/providers/LoadingFallback";
import { router } from "./app/routes/router";
import { SyncProvider } from "./app/providers/SyncProvider";
import { AuthProvider } from "./app/providers/AuthProvider";
import { ToastProvider } from "./shared/ui/Toast";
import { AppStatus } from "./app/providers/AppStatus";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <AuthProvider>
            <SyncProvider>
              <ToastProvider>
                <AppStatus>
                  <RouterProvider router={router} />
                </AppStatus>
              </ToastProvider>
            </SyncProvider>
          </AuthProvider>
        </Suspense>
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
);
