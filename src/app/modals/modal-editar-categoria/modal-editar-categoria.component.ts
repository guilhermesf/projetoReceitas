import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Categoria } from '../../models/categoria.model';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-modal-editar-categoria',
  templateUrl: './modal-editar-categoria.component.html',
  styleUrls: ['./modal-editar-categoria.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class ModalEditarCategoriaComponent implements OnInit {
  @Input() categoria!: Categoria; // A categoria a ser editada, marcada como obrigatória
  categoriaForm!: FormGroup;

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private categoriaService: CategoriaService
  ) { }

  ngOnInit() {
    this.categoriaForm = this.fb.group({
      id: [this.categoria.id], // Manter o ID para atualização
      nome: [this.categoria.nome, [Validators.required, Validators.minLength(3)]],
      descricao: [this.categoria.descricao, Validators.required],
      icone: [this.categoria.icone || ''],
      cor: [this.categoria.cor || ''],
      status: [this.categoria.status || 'ativo', Validators.required]
    });
  }

  async atualizarCategoria() {
    if (this.categoriaForm.valid) {
      const categoriaAtualizada: Categoria = this.categoriaForm.value;
      // A lógica de atualização será feita na página pai após fechar o modal
      this.fecharModal(categoriaAtualizada);
    }
  }

  fecharModal(data?: any) {
    this.modalController.dismiss(data);
  }

  // Getters para facilitar o acesso aos campos no template
  get nome() { return this.categoriaForm.get('nome'); }
  get descricao() { return this.categoriaForm.get('descricao'); }
  get icone() { return this.categoriaForm.get('icone'); }
  get cor() { return this.categoriaForm.get('cor'); }
  get status() { return this.categoriaForm.get('status'); }
} 