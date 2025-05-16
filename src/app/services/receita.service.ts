import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Receita } from '../models/receita.model';

@Injectable({
  providedIn: 'root'
})
export class ReceitaService {
  private apiUrl = 'http://localhost:3000/receitas'; //url da api

  constructor(private http: HttpClient) { }
  
  //observable é um objeto que representa um fluxo de dados assíncrono
  cadastrarReceita(receita: Receita): Observable<Receita> { //cadastrar uma nova receita
    return this.http.post<Receita>(this.apiUrl, receita);
  }

  listarReceitas(): Observable<Receita[]> { //listar todas as receitas
    return this.http.get<Receita[]>(this.apiUrl);
  }

  buscarReceita(id: string): Observable<Receita> { //buscar receita por id
    return this.http.get<Receita>(`${this.apiUrl}/${id}`);
  }

  atualizarReceita(id: string, receita: Receita): Observable<Receita> { //atualizar uma receita existente
    return this.http.put<Receita>(`${this.apiUrl}/${id}`, receita);
  }

  deletarReceita(id: string): Observable<void> { //deletar uma receita existente
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 