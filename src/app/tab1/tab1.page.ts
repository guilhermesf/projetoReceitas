import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReceitaService } from '../services/receita.service';
import { FavoritoService } from '../services/favorito.service';
import { Receita } from '../models/receita.model';
import { Favorito } from '../models/favorito.model';
import { Categoria } from '../models/categoria.model';
import { CategoriaService } from '../services/categoria.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class Tab1Page implements OnInit {
  receitas: Receita[] = [];
  favoritos: Favorito[] = [];
  filtroForm: FormGroup;
  receitasCarregadas: Receita[] = []; // Lista completa de receitas carregadas
  categorias: Categoria[] = []; // Adicionar de volta a lista de categorias

  constructor(
    private receitaService: ReceitaService,
    private favoritoService: FavoritoService,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private categoriaService: CategoriaService
  ) {
    this.filtroForm = this.formBuilder.group({
      termoBusca: [''],
      categoria: [''],
      dificuldade: [''],
      tempoMaximo: [null]
    });
  }

  ngOnInit() {
    this.carregarReceitas();
    this.carregarFavoritos();
    this.carregarCategorias();
    this.configurarFiltros();
  }

  ionViewWillEnter() {
    this.carregarReceitas();
    this.carregarFavoritos();
    this.configurarFiltros();
  }

  carregarReceitas() {
    this.receitaService.listarReceitas().subscribe({
      next: (data) => {
        this.receitasCarregadas = data; // Armazenar a lista completa
        this.aplicarFiltros(); // Aplicar filtros iniciais
      },
      error: (error) => {
        console.error('Erro ao carregar receitas:', error);
      }
    });
  }

  carregarFavoritos() {
    // Substituir 1 pelo ID do usuário logado
    const usuarioId = 1;
    this.favoritoService.getFavoritos(usuarioId).subscribe({
      next: (data) => {
        this.favoritos = data;
      },
      error: (error) => {
        console.error('Erro ao carregar favoritos:', error);
      }
    });
  }

  carregarCategorias() {
    this.categoriaService.listarCategorias().subscribe({
      next: (data: Categoria[]) => {
        this.categorias = data;
      },
      error: (error: any) => {
        console.error('Erro ao carregar categorias:', error);
      }
    });
  }

  configurarFiltros() {
    this.filtroForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  aplicarFiltros() {
    const filtro = this.filtroForm.value;
    let receitasFiltradas = this.receitasCarregadas;

    if (filtro.termoBusca) {
      const termo = filtro.termoBusca.toLowerCase();
      receitasFiltradas = receitasFiltradas.filter(receita =>
        receita.nome.toLowerCase().includes(termo) ||
        receita.ingredientes.toLowerCase().includes(termo) ||
        receita.modoPreparo.toLowerCase().includes(termo)
      );
    }

    if (filtro.categoria) {
      receitasFiltradas = receitasFiltradas.filter(receita => receita.categoriaId === filtro.categoria);
    }

    if (filtro.dificuldade) {
      receitasFiltradas = receitasFiltradas.filter(receita => receita.dificuldade === filtro.dificuldade);
    }

    if (filtro.tempoMaximo !== null && filtro.tempoMaximo !== '') {
      const tempoMax = Number(filtro.tempoMaximo);
      if (!isNaN(tempoMax)) {
        receitasFiltradas = receitasFiltradas.filter(receita => receita.tempoPreparo !== undefined && receita.tempoPreparo <= tempoMax);
      }
    }

    this.receitas = receitasFiltradas;
  }

  isFavorito(receitaId: string | undefined): boolean {
    if (!receitaId) return false;
    // Substituir 1 pelo ID do usuário logado
    const usuarioId = 1;
    return this.favoritos.some(favorito => favorito.receitaId === receitaId && favorito.usuarioId === usuarioId);
  }

  toggleFavorito(receita: Receita) {
    const usuarioId = 1; // Substituir pelo ID do usuário logado
    if (!receita.id) {
      console.error('ID da receita não encontrado para favoritar/desfavoritar');
      this.presentToast('Erro ao favoritar/desfavoritar receita.');
      return;
    }

    const favoritoExistente = this.favoritos.find(favorito => favorito.receitaId === receita.id && favorito.usuarioId === usuarioId);

    if (favoritoExistente) {
      // Remover favorito
      if (favoritoExistente.id) {
        this.favoritoService.removerFavorito(favoritoExistente.id).subscribe({
          next: () => {
            this.carregarFavoritos();
            this.presentToast('Receita removida dos favoritos!');
          },
          error: (error) => {
            console.error('Erro ao remover favorito:', error);
            this.presentToast('Erro ao remover favorito.');
          }
        });
      } else {
        console.error('ID do favorito não encontrado para remoção');
        this.presentToast('Erro ao remover favorito: ID não encontrado.');
      }
    } else {
      // Adicionar favorito
      const novoFavorito: Omit<Favorito, 'id'> = {
        usuarioId: usuarioId,
        receitaId: receita.id,
        dataAdicao: new Date()
      };
      this.favoritoService.adicionarFavorito(novoFavorito).subscribe({
        next: () => {
          this.carregarFavoritos();
          this.presentToast('Receita adicionada aos favoritos!');
        },
        error: (error) => {
          console.error('Erro ao adicionar favorito:', error);
          this.presentToast('Erro ao adicionar favorito.');
        }
      });
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  // Getters para facilitar o acesso aos campos no template (se necessário para filtro)
  get termoBusca() { return this.filtroForm.get('termoBusca'); }
  get categoria() { return this.filtroForm.get('categoria'); }
  get dificuldade() { return this.filtroForm.get('dificuldade'); }
  get tempoMaximo() { return this.filtroForm.get('tempoMaximo'); }
}
