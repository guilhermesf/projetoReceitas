import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ReceitaService } from '../../services/receita.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadastro-novo',
  templateUrl: './cadastro-novo.page.html',
  styleUrls: ['./cadastro-novo.page.scss'],
  standalone: false,
})
export class CadastroNovoPage {
  @ViewChild('form') form!: NgForm;

  constructor(
    private receitaService: ReceitaService,
    private router: Router
  ) {}

  cadastrarReceita(form: NgForm) {
    if (form.valid) {
      this.receitaService.cadastrarReceita(form.value).subscribe({
        next: () => {
          alert('Receita cadastrada com sucesso!');
          form.resetForm(); // Limpa o formulário
          this.router.navigate(['/tabs/tab2']);
        },
        error: (error) => {
          console.error('Erro ao cadastrar receita:', error);
          alert('Erro ao cadastrar receita. Tente novamente.');
        }
      });
    }
  }
}
