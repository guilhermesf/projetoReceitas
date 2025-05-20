export interface ItemListaCompras {
    id?: string;
    nome: string;
    quantidade: number;
    unidade: string;
    comprado: boolean;
    dataValidade: string;
    prioridade: 'baixa' | 'media' | 'alta';
}
