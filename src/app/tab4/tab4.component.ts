import { Component, OnInit } from '@angular/core';
import { FavoritoService } from '../services/favorito.service';
import { Favorito } from '../models/favorito.model';
import { ReceitaService } from '../services/receita.service';
import { Receita } from '../models/receita.model';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})
export class Tab4Page implements OnInit {
  favoritos: Favorito[] = [];
  receitasFavoritas: Receita[] = [];
  colecoes: string[] = [];
  colecaoAtual: string = '';

  constructor(
    private favoritoService: FavoritoService,
    private receitaService: ReceitaService
  ) {}

  ngOnInit() {
    this.carregarFavoritos();
  }

  carregarFavoritos() {
    // Aqui tem que substituir 1 pelo ID do usuário atual
    const usuarioId = 1;
    
    this.favoritoService.getFavoritos(usuarioId).subscribe(
      favoritos => {
        this.favoritos = favoritos;
        this.colecoes = [...new Set(favoritos.map(f => f.colecao).filter(Boolean))];
        this.carregarReceitasFavoritas();
      }
    );
  }

  carregarReceitasFavoritas() {
    this.receitasFavoritas = [];
    this.favoritos.forEach(favorito => {
      this.receitaService.getReceita(favorito.receitaId).subscribe(
        receita => {
          this.receitasFavoritas.push(receita);
        }
      );
    });
  }

  adicionarFavorito(receitaId: number) {
    const novoFavorito: Omit<Favorito, 'id'> = {
      usuarioId: 1, // Substituir pelo ID do usuário atual
      receitaId: receitaId,
      dataAdicao: new Date()
    };

    this.favoritoService.adicionarFavorito(novoFavorito).subscribe(
      () => {
        this.carregarFavoritos();
      }
    );
  }

  removerFavorito(id: number) {
    this.favoritoService.removerFavorito(id).subscribe(
      () => {
        this.carregarFavoritos();
      }
    );
  }

  filtrarPorColecao(colecao: string) {
    this.colecaoAtual = colecao;
    const usuarioId = 1; // Substituir pelo ID do usuário atual
    
    this.favoritoService.getFavoritosPorColecao(usuarioId, colecao).subscribe(
      favoritos => {
        this.favoritos = favoritos;
        this.carregarReceitasFavoritas();
      }
    );
  }
} 