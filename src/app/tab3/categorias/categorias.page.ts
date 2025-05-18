import { Component, OnInit } from '@angular/core';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/categoria.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ModalEditarCategoriaComponent } from 'src/app/modals/modal-editar-categoria/modal-editar-categoria.component';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.page.html',
  styleUrls: ['./categorias.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, FormsModule]
})
export class CategoriasPage implements OnInit {
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  termoBusca: string = '';
  categoriaForm: FormGroup;

  constructor(
    private categoriaService: CategoriaService,
    private router: Router,
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private alertController: AlertController
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
        this.categoriasFiltradas = data;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
      }
    });
  }

  filtrarCategorias(event: any) {
    const termo = event.target.value.toLowerCase();
    this.categoriasFiltradas = this.categorias.filter(categoria => 
      categoria.nome.toLowerCase().includes(termo) ||
      (categoria.descricao?.toLowerCase() || '').includes(termo)
    );
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
    const modal = await this.modalController.create({
      component: ModalEditarCategoriaComponent,
      componentProps: {
        categoria: categoria
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.atualizarCategoria(result.data);
      } else {
        console.log('Edição cancelada');
      }
    });

    await modal.present();
  }

  atualizarCategoria(categoriaAtualizada: Categoria) {
    if (categoriaAtualizada.id) {
      this.categoriaService.atualizarCategoria(categoriaAtualizada.id, categoriaAtualizada).subscribe({
        next: () => {
          this.carregarCategorias();
          alert('Categoria atualizada com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao atualizar categoria:', error);
          alert('Erro ao atualizar categoria. Tente novamente.');
        }
      });
    }
  }

  async confirmarExclusao(categoriaId: string) {
    if (!categoriaId || typeof categoriaId !== 'string') {
      console.error('ID da categoria inválido');
      return;
    }

    const alert = await this.alertController.create({
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
    if (!id || typeof id !== 'string') {
      console.error('ID da categoria inválido');
      return;
    }

    this.categoriaService.deletarCategoria(id).subscribe({
      next: () => {
        this.carregarCategorias();
        this.presentAlert('Sucesso', 'Categoria excluída com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao excluir categoria:', error);
        this.presentAlert('Erro', 'Erro ao excluir categoria. Tente novamente.');
      }
    });
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  // Getters para facilitar o acesso aos campos no template
  get nome() { return this.categoriaForm.get('nome'); }
  get descricao() { return this.categoriaForm.get('descricao'); }
  get icone() { return this.categoriaForm.get('icone'); }
  get cor() { return this.categoriaForm.get('cor'); }
  get status() { return this.categoriaForm.get('status'); }
} 