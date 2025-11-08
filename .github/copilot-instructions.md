# Zarfa AI Development Guide

## Project Overview
Zarfa is a blockchain-based VAT refund and payroll payment infrastructure. **Key architectural decision**: The app is currently transitioning from Aptos to Monad blockchain (EVM-compatible), with legacy Aptos code still present in the codebase.

## Critical Blockchain Context

### Active Blockchain: Monad (EVM)
- **All wallet operations use**: `src/utils/monad.ts` (MetaMask integration)
- **Chain ID**: 10143 (Monad Testnet)
- **Native currency**: MON (not APT)
- **Wallet**: MetaMask (not Petra Wallet, despite UI references)

### Legacy Code Warning
- Move smart contracts in `contracts/` are **Aptos-specific** and not deployed to Monad
- `src/utils/aptos.ts` exists but is **unused**
- `@aptos-labs/*` dependencies are legacy - ignore them for new features
- When you see Petra Wallet references in UI, understand they're historical

## Data Persistence Pattern

### localStorage-First Architecture
All user data (employees, payments) uses **localStorage as the primary store**, with Supabase as optional fallback:

```typescript
// Pattern used in src/hooks/useEmployees.ts and usePayments.ts
const localStorageKey = `Zarfa_employees_${walletAddress}`;
localStorage.setItem(localStorageKey, JSON.stringify(data));
```

**When adding data features**:
1. Store keyed by wallet address: `Zarfa_{datatype}_${walletAddress}`
2. Try localStorage first, Supabase second
3. Continue on Supabase failures (graceful degradation)

## Development Workflow

### Running the App
```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (Vite)
```

### Build Issues
Vite config has **extensive wallet adapter workarounds** (see `vite.config.ts`):
- Manual chunking prevents symbol collisions
- `keepNames: true` prevents initialization errors
- If build fails, check these settings haven't been overridden

### Smart Contracts (Currently Non-functional)
```bash
cd contracts
aptos move compile    # Compiles but won't deploy to Monad
```
**Note**: Move contracts require Aptos network. For Monad, you'll need Solidity contracts.

## Key Architecture Patterns

### Component Structure
- **Layout**: `DashboardLayout.tsx` manages routing and wallet state
- **Page Components**: Dashboard, Employees, BulkTransfer, VATRefundPage, AIAssistantPage
- **Modal Pattern**: Preview → Confirmation → Success (e.g., PaymentPreviewModal → PaymentSuccessModal)

### State Management
- **Wallet state**: Managed centrally via `WalletContext` in `src/contexts/WalletContext.tsx`
- **Tab persistence**: `localStorage.getItem("monad_pay_active_tab")` maintains navigation state
- **Route handling**: App.tsx uses `activeTab` state, not React Router
- **Global refresh**: `refreshKey` prop triggers data reload across components
- **Wallet hook**: Use `const { isConnected, address, balance, connect, disconnect } = useWallet()` in components

### AI Integration
- **Service**: `src/services/aiService.ts` uses Google Gemini API
- **Context tracking**: Maintains conversation memory with `ConversationMemory[]` array
- **Price data**: Integrates with `priceService.ts` for crypto price lookups

## Common Tasks

### Adding a New Data Type
1. Define interface in `src/lib/supabase.ts`
2. Create custom hook in `src/hooks/use{DataType}.ts` following `useEmployees` pattern
3. Use localStorage key: `Zarfa_{datatype}_${walletAddress}`
4. Add Supabase table as optional (wrap in try-catch)

### Adding Blockchain Transactions
- Use functions from `src/utils/monad.ts`
- Validate addresses with `isValidAddress(address)`
- Amount conversion: `amount * 1e18` for Wei conversion
- Always check `getConnectedAccount()` before tx

### UI Components
- Use components from `src/ui/components/` (Subframe-based design system)
- Tailwind for styling (config: `tailwind.config.js`)
- Framer Motion for animations (see App.tsx for pattern)

## Integration Points

### External Services
1. **Supabase** (`src/lib/supabase.ts`): Auth, optional data persistence
2. **Google Gemini** (`src/services/aiService.ts`): AI assistant, document processing
3. **EmailJS** (`src/utils/emailService.ts`): Email notifications
4. **Monad RPC** (`https://testnet-rpc.monad.xyz`): Blockchain interactions

### Environment Variables Required
```env
VITE_SUPABASE_URL=          # Optional, app works without
VITE_SUPABASE_ANON_KEY=     # Optional, app works without
VITE_GEMINI_API_KEY=        # Required for AI features
```

## Testing & Debugging

### Wallet Testing
- Install MetaMask extension
- Add Monad Testnet (auto-prompted on first connect)
- Get testnet MON from: `https://testnet.monad.xyz`

### Console Logging Pattern
The codebase uses extensive console logging:
- `console.log("Loaded ... from localStorage:")` - data operations
- `console.warn(...)` - missing env vars or graceful failures
- Keep this pattern for troubleshooting

## Project Conventions

### File Organization
- Components: Feature-named (e.g., `VATRefundPage.tsx`, not `Refund.tsx`)
- Hooks: Prefixed `use` + plural entity (e.g., `useEmployees`, `usePayments`)
- Utils: Named by blockchain/service (e.g., `monad.ts`, `aptos.ts`)

### TypeScript Patterns
- Interfaces from `src/lib/supabase.ts` even for non-DB data
- Optional chaining for Supabase operations: `data?.length`
- Type guards for wallet checks: `if (!walletAddress) throw new Error(...)`

### Naming
- Functions: `camelCase` (e.g., `connectWallet`, `sendPayment`)
- Components: `PascalCase` files and exports
- Blockchain: "wallet address" not "account address"

## Known Issues & Workarounds

1. **Vite Build**: Requires specific esbuild options to prevent initialization errors
2. **VAT Contract**: `submitVATRefund` throws "not deployed" - contracts need Monad migration
3. **Petra Wallet References**: UI text refers to Petra, but MetaMask is used

## Next Development Priorities
When implementing new features, consider the project roadmap from README.md:
- Multi-country VAT expansion (requires contract deployment)
- Enterprise API development
- DAO governance features

