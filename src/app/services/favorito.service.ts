import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Favorito } from '../models/favorito.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritoService {
  private apiUrl = 'http://localhost:3000/favoritos';

  constructor(private http: HttpClient) { }

  // Obter todos os favoritos do usuário
  getFavoritos(usuarioId: number): Observable<Favorito[]> {
    return this.http.get<Favorito[]>(`${this.apiUrl}?usuarioId=${usuarioId}`);
  }

  // Adicionar uma receita aos favoritos
  adicionarFavorito(favorito: Omit<Favorito, 'id'>): Observable<Favorito> {
    return this.http.post<Favorito>(this.apiUrl, favorito);
  }

  // Remover uma receita dos favoritos
  removerFavorito(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Atualizar informações do favorito (como mudar de coleção)
  atualizarFavorito(id: string, favorito: Partial<Favorito>): Observable<Favorito> {
    return this.http.patch<Favorito>(`${this.apiUrl}/${id}`, favorito);
  }

  // Obter favoritos por coleção
  getFavoritosPorColecao(usuarioId: number, colecao: string): Observable<Favorito[]> {
    return this.http.get<Favorito[]>(`${this.apiUrl}?usuarioId=${usuarioId}&colecao=${colecao}`);
  }
} 