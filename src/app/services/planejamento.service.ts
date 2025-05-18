import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Planejamento } from '../models/planejamento.model';

@Injectable({
  providedIn: 'root'
})
export class PlanejamentoService {
  private apiUrl = 'http://localhost:3000/planejamentos';

  constructor(private http: HttpClient) { }

  cadastrarPlanejamento(planejamento: Planejamento): Observable<Planejamento> {
    return this.http.post<Planejamento>(this.apiUrl, planejamento);
  }

  listarPlanejamentos(usuarioId: string): Observable<Planejamento[]> {
    return this.http.get<Planejamento[]>(`${this.apiUrl}?usuarioId=${usuarioId}`);
  }

  buscarPlanejamento(id: string): Observable<Planejamento> {
    return this.http.get<Planejamento>(`${this.apiUrl}/${id}`);
  }

  atualizarPlanejamento(id: string, planejamento: Planejamento): Observable<Planejamento> {
    return this.http.put<Planejamento>(`${this.apiUrl}/${id}`, planejamento);
  }

  deletarPlanejamento(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listarPlanejamentosPorSemana(usuarioId: string, dataInicio: Date, dataFim: Date): Observable<Planejamento[]> {
    return this.http.get<Planejamento[]>(
      `${this.apiUrl}?usuarioId=${usuarioId}&dataInicio=${dataInicio.toISOString()}&dataFim=${dataFim.toISOString()}`
    );
  }
} 