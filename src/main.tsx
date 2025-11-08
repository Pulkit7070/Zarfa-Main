import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "./contexts/WalletContext";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

// Monad uses MetaMask - wallet context provides centralized state management

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <App />
      </WalletProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
