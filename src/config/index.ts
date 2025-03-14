import { cookieStorage, createStorage } from 'wagmi';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cronosTestnet, cronos } from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694";
if (!projectId) throw new Error('Project ID non definito');

export const networks = [cronosTestnet, cronos] as [AppKitNetwork, ...AppKitNetwork[]];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;