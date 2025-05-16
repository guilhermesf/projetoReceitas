import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../../../services/categoria.service';
import { Categoria } from '../../../models/categoria.model';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-editar-categoria',
  templateUrl: './editar-categoria.page.html',
  styleUrls: ['./editar-categoria.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class EditarCategoriaPage implements OnInit {
  categoriaForm: FormGroup;

  constructor(
    private categoriaService: CategoriaService,
    private route: ActivatedRoute,
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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarCategoria(id);
    }
  }

  carregarCategoria(id: string) {
    this.categoriaService.buscarCategoria(id).subscribe({
      next: (data) => {
        this.categoriaForm.patchValue(data);
      },
      error: (error) => {
        console.error('Erro ao carregar categoria:', error);
        alert('Erro ao carregar categoria. Tente novamente.');
        this.router.navigate(['/tabs/categorias']);
      }
    });
  }

  atualizarCategoria() {
    if (this.categoriaForm.valid) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.categoriaService.atualizarCategoria(id, this.categoriaForm.value).subscribe({
          next: () => {
            alert('Categoria atualizada com sucesso!');
            this.router.navigate(['/tabs/categorias']);
          },
          error: (error) => {
            console.error('Erro ao atualizar categoria:', error);
            alert('Erro ao atualizar categoria. Tente novamente.');
          }
        });
      }
    }
  }

  // Getters para facilitar o acesso aos campos no template
  get nome() { return this.categoriaForm.get('nome'); }
  get descricao() { return this.categoriaForm.get('descricao'); }
  get icone() { return this.categoriaForm.get('icone'); }
} 