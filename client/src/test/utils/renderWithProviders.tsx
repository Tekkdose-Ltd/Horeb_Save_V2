/**
 * Custom render helper
 *
 * Wraps whatever you render in the same providers the real app uses
 * (QueryClientProvider, TooltipProvider, Router, etc.)
 *
 * Usage:
 *   import { renderWithProviders } from "@/test/utils/renderWithProviders";
 *   const { getByText } = renderWithProviders(<MyComponent />);
 */
import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't retry in tests — fail fast
        retry: false,
        staleTime: Infinity,
      },
    },
  });
}

interface WrapperProps {
  children: React.ReactNode;
  initialPath?: string;
}

function Providers({ children, initialPath = "/" }: WrapperProps) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router base="" ssrPath={initialPath}>
          {children}
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialPath?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  { initialPath = "/", ...options }: CustomRenderOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <Providers initialPath={initialPath}>{children}</Providers>
    ),
    ...options,
  });
}

// Re-export everything from @testing-library/react so tests only need one import
export * from "@testing-library/react";
export { userEvent } from "@testing-library/user-event";
