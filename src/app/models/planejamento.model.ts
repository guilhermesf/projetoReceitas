export interface Planejamento {
  id?: string;
  data: Date;
  refeicao: 'cafe' | 'almoco' | 'jantar' | 'lanche';
  receitaId: string;
  observacoes?: string;
  usuarioId: string;
}

export type TipoRefeicao = 'cafe' | 'almoco' | 'jantar' | 'lanche';

export const TIPOS_REFEICAO: { [key in TipoRefeicao]: string } = {
  cafe: 'Café da Manhã',
  almoco: 'Almoço',
  jantar: 'Jantar',
  lanche: 'Lanche'
}; 