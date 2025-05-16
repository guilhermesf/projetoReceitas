import { Component, OnInit } from '@angular/core';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/categoria.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.page.html',
  styleUrls: ['./categorias.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterLink]
})
export class CategoriasPage implements OnInit {
  categorias: Categoria[] = [];
  categoriaForm: FormGroup;

  constructor(
    private categoriaService: CategoriaService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.categoriaForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      descricao: ['', Validators.required],
      icone: ['']
    });
  }

  ngOnInit() {
    this.carregarCategorias();
  }

  ionViewWillEnter() {
    this.carregarCategorias();
  }

  carregarCategorias() {
    this.categoriaService.listarCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
      }
    });
  }

  cadastrarCategoria() {
    if (this.categoriaForm.valid) {
      const novaCategoria: Categoria = this.categoriaForm.value;
      this.categoriaService.cadastrarCategoria(novaCategoria).subscribe({
        next: () => {
          this.carregarCategorias();
          this.categoriaForm.reset();
          alert('Categoria cadastrada com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao cadastrar categoria:', error);
          alert('Erro ao cadastrar categoria. Tente novamente.');
        }
      });
    }
  }

  deletarCategoria(id?: string) {
    if (!id) {
      console.error('ID da categoria não encontrado');
      return;
    }

    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      this.categoriaService.deletarCategoria(id).subscribe({
        next: () => {
          this.carregarCategorias();
          alert('Categoria excluída com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao excluir categoria:', error);
          alert('Erro ao excluir categoria. Tente novamente.');
        }
      });
    }
  }

  // Getters para facilitar o acesso aos campos no template
  get nome() { return this.categoriaForm.get('nome'); }
  get descricao() { return this.categoriaForm.get('descricao'); }
  get icone() { return this.categoriaForm.get('icone'); }
} 