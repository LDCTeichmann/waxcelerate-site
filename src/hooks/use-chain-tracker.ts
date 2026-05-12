import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChainRotation {
  chainId: string;
  name: string;
  waxDate: string;
  kmSinceWax: number;
  totalKm: number;
}

interface ChainTrackerState {
  chains: ChainRotation[];
  activeChainId: string | null;
  addChain: (name: string) => void;
  removeChain: (chainId: string) => void;
  waxChain: (chainId: string) => void;
  updateKm: (chainId: string, km: number) => void;
  setActiveChain: (chainId: string) => void;
  getChainToWax: () => ChainRotation | null;
}

export const useChainTracker = create<ChainTrackerState>()(
  persist(
    (set, get) => ({
      chains: [],
      activeChainId: null,
      
      addChain: (name) => {
        const newChain: ChainRotation = {
          chainId: `chain-${Date.now()}`,
          name,
          waxDate: new Date().toISOString(),
          kmSinceWax: 0,
          totalKm: 0,
        };
        set((state) => ({
          chains: [...state.chains, newChain],
          activeChainId: state.activeChainId || newChain.chainId,
        }));
      },
      
      removeChain: (chainId) => {
        set((state) => ({
          chains: state.chains.filter((c) => c.chainId !== chainId),
          activeChainId:
            state.activeChainId === chainId
              ? state.chains.find((c) => c.chainId !== chainId)?.chainId || null
              : state.activeChainId,
        }));
      },
      
      waxChain: (chainId) => {
        set((state) => ({
          chains: state.chains.map((c) =>
            c.chainId === chainId
              ? { ...c, waxDate: new Date().toISOString(), kmSinceWax: 0 }
              : c
          ),
        }));
      },
      
      updateKm: (chainId, km) => {
        set((state) => ({
          chains: state.chains.map((c) =>
            c.chainId === chainId
              ? { ...c, kmSinceWax: c.kmSinceWax + km, totalKm: c.totalKm + km }
              : c
          ),
        }));
      },
      
      setActiveChain: (chainId) => {
        set({ activeChainId: chainId });
      },
      
      getChainToWax: () => {
        const { chains } = get();
        if (chains.length === 0) return null;
        
        // Find chain with most km since wax
        return chains.reduce((max, chain) =>
          chain.kmSinceWax > max.kmSinceWax ? chain : max
        );
      },
    }),
    {
      name: 'waxcelerate-chains',
    }
  )
);
