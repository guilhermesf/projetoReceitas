import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReceitaService } from '../../services/receita.service';
import { CategoriaService } from '../../services/categoria.service';
import { Router } from '@angular/router';
import { Categoria } from '../../models/categoria.model';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-cadastro-novo',
  templateUrl: './cadastro-novo.page.html',
  styleUrls: ['./cadastro-novo.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class CadastroNovoPage implements OnInit {
  receitaForm: FormGroup;
  categorias: Categoria[] = [];

  constructor(
    private receitaService: ReceitaService,
    private categoriaService: CategoriaService,
    private router: Router,
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

  cadastrarReceita() {
    if (this.receitaForm.valid) {
      this.receitaService.cadastrarReceita(this.receitaForm.value).subscribe({
        next: () => {
          alert('Receita cadastrada com sucesso!');
          this.receitaForm.reset();
          this.router.navigate(['/tabs/tab2']);
        },
        error: (error) => {
          console.error('Erro ao cadastrar receita:', error);
          alert('Erro ao cadastrar receita. Tente novamente.');
        }
      });
    }
  }

  // Getters para facilitar o acesso aos campos no template
  get nome() { return this.receitaForm.get('nome'); }
  get categoriaId() { return this.receitaForm.get('categoriaId'); }
  get ingredientes() { return this.receitaForm.get('ingredientes'); }
  get modoPreparo() { return this.receitaForm.get('modoPreparo'); }
  get tempoPreparo() { return this.receitaForm.get('tempoPreparo'); }
  get porcoes() { return this.receitaForm.get('porcoes'); }
  get dificuldade() { return this.receitaForm.get('dificuldade'); }
}
