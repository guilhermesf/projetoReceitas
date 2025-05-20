import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemListaCompras } from '../models/lista-compras.model';

@Injectable({
  providedIn: 'root'
})
export class ListaComprasService {
  private apiUrl = 'http://localhost:3000/lista-compras';

  constructor(private http: HttpClient) { }

  // Listar todos os itens
  listarItens(): Observable<ItemListaCompras[]> {
    return this.http.get<ItemListaCompras[]>(this.apiUrl);
  }

  // Adicionar novo item
  adicionarItem(item: ItemListaCompras): Observable<ItemListaCompras> {
    const novoItem = {
      ...item,
      dataCriacao: new Date().toISOString()
    };
    return this.http.post<ItemListaCompras>(this.apiUrl, novoItem);
  }

  // Atualizar item
  atualizarItem(id: string, item: ItemListaCompras): Observable<ItemListaCompras> {
    return this.http.put<ItemListaCompras>(`${this.apiUrl}/${id}`, item);
  }

  // Remover item
  removerItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Alternar estado de comprado
  alternarEstadoComprado(id: string, comprado: boolean): Observable<ItemListaCompras> {
    return this.http.patch<ItemListaCompras>(`${this.apiUrl}/${id}`, { comprado });
  }
} 