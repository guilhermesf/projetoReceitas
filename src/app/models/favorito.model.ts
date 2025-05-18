export interface Favorito {
    id: number;
    usuarioId: number;
    receitaId: string;
    dataAdicao: Date;
    colecao?: string;
} 