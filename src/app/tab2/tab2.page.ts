import { Component, OnInit } from '@angular/core';
import { ReceitaService } from '../services/receita.service';
import { CategoriaService } from '../services/categoria.service';
import { Receita } from '../models/receita.model';
import { Categoria } from '../models/categoria.model';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  receitas: Receita[] = [];
  categorias: { [key: string]: Categoria } = {};

  constructor(
    private receitaService: ReceitaService,
    private categoriaService: CategoriaService
  ) {}

  //tem diferença entre ngOnInit e ionViewWillEnter - ngOnInit é chamado quando o componente é criado, 
  //e ionViewWillEnter é chamado quando o componente é exibido
  
  ngOnInit() {
    this.carregarDados();
  }

  ionViewWillEnter() {
    this.carregarDados(); //busca do banco de dados - dados atualizados  
  }

  carregarDados() {
    this.carregarCategorias();
    this.carregarReceitas();
  }

  carregarCategorias() {
    this.categoriaService.listarCategorias().subscribe({
      next: (data) => {
        this.categorias = data.reduce((acc, categoria) => {
          acc[categoria.id!] = categoria;
          return acc;
        }, {} as { [key: string]: Categoria });
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
      }
    });
  }

  carregarReceitas() {
    this.receitaService.listarReceitas().subscribe({
      next: (data) => {
        this.receitas = data;
      },
      error: (error) => {
        console.error('Erro ao carregar receitas:', error);
      }
    });
  }

  deletarReceita(id?: string) {
    if (!id) {
      console.error('ID da receita não encontrado');
      return;
    }

    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      this.receitaService.deletarReceita(id).subscribe({
        next: () => {
          this.carregarReceitas();
          alert('Receita excluída com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao excluir receita:', error);
          alert('Erro ao excluir receita. Tente novamente.');
        }
      });
    }
  }

  getCategoriaNome(categoriaId?: string): string {
    if (!categoriaId) return 'Sem categoria';
    return this.categorias[categoriaId]?.nome || 'Sem categoria';
  }

  getDificuldadeTexto(dificuldade?: string): string {
    if (!dificuldade) return 'Não definida';
    const dificuldades = {
      'facil': 'Fácil',
      'medio': 'Médio',
      'dificil': 'Difícil'
    };
    return dificuldades[dificuldade as keyof typeof dificuldades] || 'Não definida';
  }
}
