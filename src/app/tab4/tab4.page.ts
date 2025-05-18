import { Component, OnInit } from '@angular/core';
import { FavoritoService } from '../services/favorito.service';
import { Favorito } from '../models/favorito.model';
import { ReceitaService } from '../services/receita.service';
import { Receita } from '../models/receita.model';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ViewWillEnter } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ModalDetalheReceitaComponent } from '../modals/modal-detalhe-receita/modal-detalhe-receita.component';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class Tab4Page implements OnInit, ViewWillEnter {
  favoritos: Favorito[] = [];
  receitasFavoritas: Receita[] = [];
  colecoes: string[] = [];
  colecaoAtual: string = '';
  filtroForm: FormGroup;

  constructor(
    private favoritoService: FavoritoService,
    private receitaService: ReceitaService,
    private formBuilder: FormBuilder,
    private modalController: ModalController
  ) {
    this.filtroForm = this.formBuilder.group({
      colecao: ['']
    });
  }

  ngOnInit() {
    //tem que ter esse metodo, se não explode tudo 
  }

  ionViewWillEnter() {
    console.log('Tab4: ionViewWillEnter');
    this.carregarFavoritos();
  }

  carregarFavoritos() {
    // quando tiver banco e login, dai aqui tem que substituir 1 pelo ID do usuário atual
    const usuarioId = 1;
    
    this.favoritoService.getFavoritos(usuarioId).subscribe({
      next: (favoritos) => {
        this.favoritos = favoritos;
        // Reconfigurar coleções e filtros ao carregar favoritos
        this.colecoes = [...new Set(favoritos.map(f => f.colecao).filter(Boolean) as string[])];
        this.filtrarPorColecao(this.colecaoAtual); // Aplicar filtro atual após carregar
      },
      error: (erro) => {
        console.error('Erro ao carregar favoritos:', erro);
        alert('Erro ao carregar favoritos. Tente novamente.');
      }
    });
  }

  async carregarReceitasFavoritas() {
    try {
      this.receitasFavoritas = [];
      console.log('Favoritos carregados (dentro de carregarRecipesFavoritas):', this.favoritos);
      
      const receitaPromises = this.favoritos.map(favorito => {
        console.log('Buscando detalhes da receita com ID:', favorito.receitaId);
        // Passando receitaId diretamente, já que agora é string
        return firstValueFrom(this.receitaService.buscarReceita(favorito.receitaId));
      });

      const receitas = await Promise.all(receitaPromises);
      console.log('Receitas encontradas (após Promise.all):', receitas);
      
      this.receitasFavoritas = receitas.filter(Boolean) as Receita[];
      console.log('receitasFavoritas preenchido com:', this.receitasFavoritas);
    } catch (error) {
      console.error('Erro detalhado ao carregar receitas favoritas:', error);
      alert('Erro ao carregar receitas favoritas. Tente novamente.');
    }
  }

  async abrirModalDetalheReceita(receitaId: string | undefined) {
    if (!receitaId) {
      console.error('ID da receita não fornecido para abrir modal.');
      return;
    }

    const modal = await this.modalController.create({
      component: ModalDetalheReceitaComponent,
      componentProps: {
        receitaId: receitaId
      }
    });
    await modal.present();
  }

  adicionarFavorito(receitaId: string) {
    const novoFavorito: Omit<Favorito, 'id'> = {
      usuarioId: 1,
      receitaId: receitaId,
      dataAdicao: new Date()
    };

    this.favoritoService.adicionarFavorito(novoFavorito).subscribe({
      next: () => {
        this.carregarFavoritos();
      },
      error: (erro) => {
        console.error('Erro ao adicionar favorito:', erro);
        alert('Erro ao adicionar favorito. Tente novamente.');
      }
    });
  }

  removerFavorito(id: number | undefined) {
    if (id === undefined) {
      console.error('ID do favorito não fornecido para remoção.');
      alert('Não foi possível remover o favorito: ID não encontrado.');
      return;
    }

    this.favoritoService.removerFavorito(id).subscribe({
      next: () => {
        this.carregarFavoritos();
      },
      error: (erro) => {
        console.error('Erro ao remover favorito:', erro);
        alert('Erro ao remover favorito. Tente novamente.');
      }
    });
  }

  filtrarPorColecao(colecao: string) {
    this.colecaoAtual = colecao;
    const usuarioId = 1;
    
    this.favoritoService.getFavoritosPorColecao(usuarioId, colecao).subscribe({
      next: (favoritos) => {
        this.favoritos = favoritos;
        this.carregarReceitasFavoritas();
      },
      error: (erro) => {
        console.error('Erro ao filtrar favoritos:', erro);
        alert('Erro ao filtrar favoritos. Tente novamente.');
      }
    });
  }

  getReceitaNome(receitaId: string | undefined): string {
    console.log('Chamado getReceitaNome para receitaId:', receitaId);
    if (receitaId === undefined) {
      return 'Receita desconhecida';
    }
    const receita = this.receitasFavoritas.find(r => r.id === receitaId);
    console.log('Resultado de busca para nome:', receita);
    return receita ? receita.nome : 'Receita não encontrada';
  }

  getReceitaIngredientes(receitaId: string | undefined): string {
    console.log('Chamado getReceitaIngredientes para receitaId:', receitaId);
    if (receitaId === undefined) {
      return 'Ingredientes desconhecidos';
    }
    const receita = this.receitasFavoritas.find(r => r.id === receitaId);
    console.log('Resultado de busca para ingredientes:', receita);
    return receita ? receita.ingredientes : 'Ingredientes não encontrados';
  }
}
