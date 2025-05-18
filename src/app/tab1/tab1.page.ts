import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReceitaService } from '../services/receita.service';
import { FavoritoService } from '../services/favorito.service';
import { CategoriaService } from '../services/categoria.service';
import { Receita } from '../models/receita.model';
import { Favorito } from '../models/favorito.model';
import { Categoria } from '../models/categoria.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class Tab1Page implements OnInit, OnDestroy {
  filtroForm: FormGroup;
  receitas: Receita[] = [];
  receitasFiltradas: Receita[] = [];
  favoritos: Favorito[] = [];
  categorias: Categoria[] = [];
  private subscription: Subscription = new Subscription();
  private usuarioId = 1; // TODO: Implementar autenticação e pegar o ID do usuário logado

  constructor(
    private fb: FormBuilder,
    private receitaService: ReceitaService,
    private favoritoService: FavoritoService,
    private categoriaService: CategoriaService,
    private toastController: ToastController
  ) {
    this.filtroForm = this.fb.group({
      categoria: [''],
      dificuldade: [''],
      tempoMaximo: ['']
    });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.carregarReceitas();
    this.carregarFavoritos();
    this.carregarCategorias();
    this.configurarFiltros();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private async mostrarToast(mensagem: string, cor: string = 'success') {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2000,
      color: cor,
      position: 'bottom'
    });
    await toast.present();
  }

  private carregarReceitas() {
    this.subscription.add(
      this.receitaService.listarReceitas().subscribe({
        next: (receitas: Receita[]) => {
          this.receitas = receitas;
          this.aplicarFiltros();
        },
        error: (erro: Error) => {
          console.error('Erro ao carregar receitas:', erro);
          this.mostrarToast('Erro ao carregar receitas', 'danger');
        }
      })
    );
  }

  private carregarFavoritos() {
    this.subscription.add(
      this.favoritoService.getFavoritos(this.usuarioId).subscribe({
        next: (favoritos) => {
          this.favoritos = favoritos;
        },
        error: (erro: Error) => {
          console.error('Erro ao carregar favoritos:', erro);
          this.mostrarToast('Erro ao carregar favoritos', 'danger');
        }
      })
    );
  }

  private carregarCategorias() {
    this.subscription.add(
      this.categoriaService.listarCategorias().subscribe({
        next: (categorias) => {
          this.categorias = categorias;
        },
        error: (erro: Error) => {
          console.error('Erro ao carregar categorias:', erro);
          this.mostrarToast('Erro ao carregar categorias', 'danger');
        }
      })
    );
  }

  isFavorito(receitaId: string | undefined): boolean {
    if (!receitaId) return false;
    return this.favoritos.some(f => f.receitaId === receitaId);
  }

  toggleFavorito(receita: Receita) {
    if (!receita.id) {
      console.error('ID da receita não encontrado');
      this.mostrarToast('Erro: ID da receita não encontrado', 'danger');
      return;
    }
    
    const receitaId = receita.id;
    
    if (this.isFavorito(receita.id)) {
      const favorito = this.favoritos.find(f => f.receitaId === receitaId);
      if (favorito && favorito.id) {
        this.subscription.add(
          this.favoritoService.removerFavorito(favorito.id).subscribe({
            next: () => {
              this.favoritos = this.favoritos.filter(f => f.id !== favorito.id);
              this.mostrarToast('Receita removida dos favoritos');
            },
            error: (erro: Error) => {
              console.error('Erro ao remover favorito:', erro);
              this.mostrarToast('Erro ao remover dos favoritos', 'danger');
            }
          })
        );
      }
    } else {
      const novoFavorito: Omit<Favorito, 'id'> = {
        usuarioId: this.usuarioId,
        receitaId: receitaId,
        dataAdicao: new Date()
      };
      this.subscription.add(
        this.favoritoService.adicionarFavorito(novoFavorito).subscribe({
          next: (favorito) => {
            this.favoritos.push(favorito);
            this.mostrarToast('Receita adicionada aos favoritos');
          },
          error: (erro: Error) => {
            console.error('Erro ao adicionar favorito:', erro);
            this.mostrarToast('Erro ao adicionar aos favoritos', 'danger');
          }
        })
      );
    }
  }

  private configurarFiltros() {
    this.subscription.add(
      this.filtroForm.valueChanges.subscribe(() => {
        this.aplicarFiltros();
      })
    );
  }

  private aplicarFiltros() {
    const filtros = this.filtroForm.value;
    this.receitasFiltradas = [...this.receitas];

    if (filtros.categoria) {
      this.receitasFiltradas = this.receitasFiltradas.filter(
        receita => receita.categoriaId === filtros.categoria
      );
    }

    if (filtros.dificuldade) {
      this.receitasFiltradas = this.receitasFiltradas.filter(
        receita => receita.dificuldade === filtros.dificuldade
      );
    }

    if (filtros.tempoMaximo) {
      this.receitasFiltradas = this.receitasFiltradas.filter(
        receita => receita.tempoPreparo && receita.tempoPreparo <= filtros.tempoMaximo
      );
    }
  }
}
