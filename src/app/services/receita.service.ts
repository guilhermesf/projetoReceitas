import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceitaService {
  private apiUrl = 'http://localhost:3000/receitas';

  constructor(private http: HttpClient) { }

  cadastrarReceita(receita: any): Observable<any> {
    return this.http.post(this.apiUrl, receita);
  }

  listarReceitas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  buscarReceita(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  atualizarReceita(id: string, receita: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, receita);
  }

  deletarReceita(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 