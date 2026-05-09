export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Ingrediente {
  nome: string;
  quantidade: string;
  unidade: string;
  extra: boolean;
}

export interface Passo {
  ordem: number;
  descricao: string;
}

export interface ReceitaGerada {
  titulo: string;
  descricao?: string;
  foto_url?: string;
  tempo_minutos?: number;
  porcoes?: number;
  dificuldade?: "fácil" | "médio" | "difícil";
  ingredientes: Ingrediente[];
  passos: Passo[];
  tags: string[];
  dica?: string;
  publica: boolean;
  gerada_por_ia: boolean;
}

export interface ReceitaComAutor {
  id: string;
  titulo: string;
  descricao: string | null;
  foto_url: string | null;
  tempo_minutos: number | null;
  dificuldade: "fácil" | "médio" | "difícil" | null;
  tags: string[];
  curtidas_count: number;
  comentarios_count: number;
  gerada_por_ia: boolean;
  created_at: string;
  viewer_has_liked?: boolean;
  viewer_has_saved?: boolean;
  perfis: {
    id: string;
    username: string;
    nome_exibicao: string;
    avatar_url: string | null;
  } | null;
}

export interface ComentarioComAutor {
  id: string;
  user_id: string;
  receita_id: string;
  conteudo: string;
  created_at: string;
  perfis: {
    id: string;
    username: string;
    nome_exibicao: string;
    avatar_url: string | null;
  } | null;
}

export interface NotificacaoComAtor {
  id: string;
  user_id: string;
  actor_id: string;
  receita_id: string | null;
  tipo: "like" | "comentario" | "nova_receita_seguindo";
  lida: boolean;
  created_at: string;
  actor: {
    id: string;
    username: string;
    nome_exibicao: string;
    avatar_url: string | null;
  } | null;
  receita: {
    id: string;
    titulo: string;
  } | null;
}

export type Database = {
  public: {
    Tables: {
      perfis: {
        Row: {
          id: string;
          username: string;
          nome_exibicao: string;
          bio: string | null;
          avatar_url: string | null;
          receitas_count: number;
          seguidores_count: number;
          seguindo_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          nome_exibicao?: string;
          bio?: string | null;
          avatar_url?: string | null;
          receitas_count?: number;
          seguidores_count?: number;
          seguindo_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          nome_exibicao?: string;
          bio?: string | null;
          avatar_url?: string | null;
          receitas_count?: number;
          seguidores_count?: number;
          seguindo_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      receitas: {
        Row: {
          id: string;
          user_id: string;
          titulo: string;
          descricao: string | null;
          foto_url: string | null;
          tempo_minutos: number | null;
          porcoes: number | null;
          dificuldade: "fácil" | "médio" | "difícil" | null;
          ingredientes: Ingrediente[];
          passos: Passo[];
          tags: string[];
          dica: string | null;
          gerada_por_ia: boolean;
          publica: boolean;
          curtidas_count: number;
          comentarios_count: number;
          salvamentos_count: number;
          views_count: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          titulo: string;
          descricao?: string | null;
          foto_url?: string | null;
          tempo_minutos?: number | null;
          porcoes?: number | null;
          dificuldade?: "fácil" | "médio" | "difícil" | null;
          ingredientes: Ingrediente[];
          passos: Passo[];
          tags?: string[];
          dica?: string | null;
          gerada_por_ia?: boolean;
          publica?: boolean;
          curtidas_count?: number;
          comentarios_count?: number;
          salvamentos_count?: number;
          views_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          titulo?: string;
          descricao?: string | null;
          foto_url?: string | null;
          tempo_minutos?: number | null;
          porcoes?: number | null;
          dificuldade?: "fácil" | "médio" | "difícil" | null;
          ingredientes?: Ingrediente[];
          passos?: Passo[];
          tags?: string[];
          dica?: string | null;
          gerada_por_ia?: boolean;
          publica?: boolean;
          curtidas_count?: number;
          comentarios_count?: number;
          salvamentos_count?: number;
          views_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      curtidas: {
        Row: {
          id: string;
          user_id: string;
          receita_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          receita_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          receita_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      salvamentos: {
        Row: {
          id: string;
          user_id: string;
          receita_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          receita_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          receita_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      comentarios: {
        Row: {
          id: string;
          user_id: string;
          receita_id: string;
          conteudo: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          receita_id: string;
          conteudo: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          receita_id?: string;
          conteudo?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      seguidores: {
        Row: {
          seguidor_id: string;
          seguido_id: string;
          created_at: string;
        };
        Insert: {
          seguidor_id: string;
          seguido_id: string;
          created_at?: string;
        };
        Update: {
          seguidor_id?: string;
          seguido_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      notificacoes: {
        Row: {
          id: string;
          user_id: string;
          actor_id: string;
          receita_id: string | null;
          tipo: "like" | "comentario" | "nova_receita_seguindo";
          lida: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          actor_id: string;
          receita_id?: string | null;
          tipo: "like" | "comentario" | "nova_receita_seguindo";
          lida?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          actor_id?: string;
          receita_id?: string | null;
          tipo?: "like" | "comentario" | "nova_receita_seguindo";
          lida?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      web_vitals_events: {
        Row: {
          id: string;
          metric_id: string;
          name: "CLS" | "LCP" | "INP" | "FCP" | "TTFB";
          value: number;
          rating: "good" | "needs-improvement" | "poor";
          pathname: string;
          navigation_type: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          metric_id: string;
          name: "CLS" | "LCP" | "INP" | "FCP" | "TTFB";
          value: number;
          rating: "good" | "needs-improvement" | "poor";
          pathname: string;
          navigation_type?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          metric_id?: string;
          name?: "CLS" | "LCP" | "INP" | "FCP" | "TTFB";
          value?: number;
          rating?: "good" | "needs-improvement" | "poor";
          pathname?: string;
          navigation_type?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

export type Perfil = Database["public"]["Tables"]["perfis"]["Row"];
export type Receita = Database["public"]["Tables"]["receitas"]["Row"];
