export interface Categoria {
  id?: string;
  nome: string;
  descricao?: string;
  icone?: string;
  cor?: string;
  status?: 'ativo' | 'inativo';
} 