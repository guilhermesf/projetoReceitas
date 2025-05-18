export interface Favorito {
    id: string;
    usuarioId: number;
    receitaId: string;
    dataAdicao: Date;
    colecao?: string;
} 