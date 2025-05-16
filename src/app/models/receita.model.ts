export interface Receita {
  id?: string;
  nome: string;
  ingredientes: string;
  modoPreparo: string;
  categoriaId?: string;
  tempoPreparo?: number;
  porcoes?: number;
  dificuldade?: 'facil' | 'medio' | 'dificil';
  imagem?: string;
} 