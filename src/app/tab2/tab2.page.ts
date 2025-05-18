import { Component, OnInit } from '@angular/core';
import { ReceitaService } from '../services/receita.service';
import { CategoriaService } from '../services/categoria.service';
import { Receita } from '../models/receita.model';
import { Categoria } from '../models/categoria.model';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterLink]
})
export class Tab2Page implements OnInit {
  receitas: Receita[] = [];
  categorias: { [key: string]: Categoria } = {};
  receitaForm: FormGroup;
  receitaEditando: Receita | null = null;

  constructor(
    private receitaService: ReceitaService,
    private categoriaService: CategoriaService,
    private formBuilder: FormBuilder
  ) {
    this.receitaForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      categoriaId: ['', Validators.required],
      ingredientes: ['', Validators.required],
      modoPreparo: ['', Validators.required],
      tempoPreparo: ['', [Validators.required, Validators.min(1)]],
      porcoes: ['', [Validators.required, Validators.min(1)]],
      dificuldade: ['', Validators.required]
    });
  }

  //tem diferença entre ngOnInit e ionViewWillEnter - ngOnInit é chamado quando o componente é criado, 
  //e ionViewWillEnter é chamado quando o componente é exibido
  
  ngOnInit() {
    this.carregarReceitas();
    this.carregarCategorias();
  }

  ionViewWillEnter() {
    this.carregarReceitas(); //busca do banco de dados - dados atualizados  
  }

  carregarCategorias() {
    this.categoriaService.listarCategorias().subscribe({
      next: (data) => {
        data.forEach(categoria => {
          if (categoria.id) {
            this.categorias[categoria.id] = categoria;
          }
        });
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

  getCategoriaNome(categoriaId: string): string {
    return this.categorias[categoriaId]?.nome || 'Categoria não encontrada';
  }

  getDificuldadeTexto(dificuldade: string): string {
    const dificuldades: { [key: string]: string } = {
      'facil': 'Fácil',
      'medio': 'Médio',
      'dificil': 'Difícil'
    };
    return dificuldades[dificuldade] || dificuldade;
  }

  editarReceita(receita: Receita) {
    this.receitaEditando = receita;
    this.receitaForm.patchValue({
      nome: receita.nome,
      categoriaId: receita.categoriaId,
      ingredientes: receita.ingredientes,
      modoPreparo: receita.modoPreparo,
      tempoPreparo: receita.tempoPreparo,
      porcoes: receita.porcoes,
      dificuldade: receita.dificuldade
    });
  }

  atualizarReceita() {
    if (this.receitaForm.valid && this.receitaEditando?.id) {
      this.receitaService.atualizarReceita(this.receitaEditando.id, this.receitaForm.value).subscribe({
        next: () => {
          this.carregarReceitas();
          this.receitaEditando = null;
          this.receitaForm.reset();
          alert('Receita atualizada com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao atualizar receita:', error);
          alert('Erro ao atualizar receita. Tente novamente.');
        }
      });
    }
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

  // Getters para validação
  get nome() { return this.receitaForm.get('nome'); }
  get categoriaId() { return this.receitaForm.get('categoriaId'); }
  get ingredientes() { return this.receitaForm.get('ingredientes'); }
  get modoPreparo() { return this.receitaForm.get('modoPreparo'); }
  get tempoPreparo() { return this.receitaForm.get('tempoPreparo'); }
  get porcoes() { return this.receitaForm.get('porcoes'); }
  get dificuldade() { return this.receitaForm.get('dificuldade'); }
}
