import { create } from "zustand";

import type { ReceitaGerada } from "@/lib/supabase/types";

interface ReceitaStore {
  receitaGerada: ReceitaGerada | null;
  ingredientesUsados: string[];
  setIngredientesUsados: (ingredientes: string[]) => void;
  setReceitaGerada: (receita: ReceitaGerada, ingredientes: string[]) => void;
  limpar: () => void;
}

export const useReceitaStore = create<ReceitaStore>((set) => ({
  receitaGerada: null,
  ingredientesUsados: [],
  setIngredientesUsados: (ingredientes) => set({ ingredientesUsados: ingredientes }),
  setReceitaGerada: (receita, ingredientes) =>
    set({ receitaGerada: receita, ingredientesUsados: ingredientes }),
  limpar: () => set({ receitaGerada: null, ingredientesUsados: [] }),
}));
