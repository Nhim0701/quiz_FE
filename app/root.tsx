import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "@/assets/css/index.css";
import "@/i18n";
import { Toaster } from "@/components/ui/sonner";
import { NotFound } from "@/components/common/not-found";
import { AppDialog } from "@/components/common/app-dialog";
import { TooltipProvider } from "./components/ui/tooltip";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* Apply theme before React hydrates to prevent hydration mismatch */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var theme = null;
                  if (stored) {
                    try {
                      var parsed = JSON.parse(stored);
                      theme = parsed && parsed.state && parsed.state.theme ? parsed.state.theme : null;
                    } catch (e) {
                      // Fallback: check if stored is direct value
                      if (stored === 'dark' || stored === 'light') {
                        theme = stored;
                      }
                    }
                  }
                  if (theme === 'dark' || theme === 'light') {
                    document.documentElement.classList.toggle('dark', theme === 'dark');
                  } else {
                    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.classList.toggle('dark', prefersDark);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <ScrollRestoration />
        <Scripts />
        <Toaster />
        <AppDialog />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // Show 404 page for 404 errors
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  // For other errors, show error details (especially in development)
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = "Error";
    details = error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
