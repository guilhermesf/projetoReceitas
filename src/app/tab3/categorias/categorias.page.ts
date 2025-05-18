import { Component, OnInit } from '@angular/core';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/categoria.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { alertController } from '@ionic/core';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.page.html',
  styleUrls: ['./categorias.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class CategoriasPage implements OnInit {
  categorias: Categoria[] = [];
  categoriaForm: FormGroup;
  categoriaEditando: Categoria | null = null;
  isEditing = false;
  categoriaIdEditing: string | null = null;

  constructor(
    private categoriaService: CategoriaService,
    private router: Router,
    private formBuilder: FormBuilder,
    private modalController: ModalController
  ) {
    this.categoriaForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      descricao: ['', Validators.required],
      icone: [''],
      cor: [''],
      status: ['ativo', Validators.required]
    });
  }

  ngOnInit() {
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

  async editarCategoria(categoria: Categoria) {
    this.isEditing = true;
    this.categoriaIdEditing = categoria.id || null;
    this.categoriaForm.reset();
    this.categoriaForm.patchValue({
      nome: categoria.nome,
      descricao: categoria.descricao,
      icone: categoria.icone || '',
      cor: categoria.cor || '',
      status: categoria.status || 'ativo'
    });

    const modal = await this.modalController.create({
      component: CategoriasPage,
      componentProps: {
        isEditing: true,
        categoriaIdEditing: this.categoriaIdEditing,
        categoriaForm: this.categoriaForm
      }
    });

    modal.onDidDismiss().then(() => {
      this.isEditing = false;
      this.categoriaIdEditing = null;
      this.categoriaForm.reset({ status: 'ativo' });
      this.carregarCategorias();
    });

    return await modal.present();
  }

  async atualizarCategoria() {
    if (this.categoriaForm.valid && this.categoriaIdEditing) {
      const categoriaAtualizada: Categoria = { ...this.categoriaForm.value, id: this.categoriaIdEditing };
      this.categoriaService.atualizarCategoria(this.categoriaIdEditing, categoriaAtualizada).subscribe({
        next: () => {
          this.carregarCategorias();
          this.cancelarEdicao();
        },
        error: (error) => {
          console.error('Erro ao atualizar categoria:', error);
          alert('Erro ao atualizar categoria. Tente novamente.');
        }
      });
    }
  }

  async confirmarExclusao(categoriaId: string) {
    const alert = await alertController.create({
      header: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir esta categoria?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Excluir',
          handler: () => {
            this.deletarCategoria(categoriaId);
          },
        },
      ],
    });
    await alert.present();
  }

  deletarCategoria(id: string) {
    if (!id) {
      console.error('ID da categoria não fornecido');
      return;
    }

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

  cancelarEdicao() {
    this.modalController.dismiss();
  }

  // Getters para facilitar o acesso aos campos no template
  get nome() { return this.categoriaForm.get('nome'); }
  get descricao() { return this.categoriaForm.get('descricao'); }
  get icone() { return this.categoriaForm.get('icone'); }
  get cor() { return this.categoriaForm.get('cor'); }
  get status() { return this.categoriaForm.get('status'); }
} 