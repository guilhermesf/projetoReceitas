import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { PlanejamentoService } from '../../services/planejamento.service';
import { ReceitaService } from '../../services/receita.service';
import { Planejamento, TIPOS_REFEICAO, TipoRefeicao } from '../../models/planejamento.model';
import { Receita } from '../../models/receita.model';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-planejamento',
  templateUrl: './planejamento.page.html',
  styleUrls: ['./planejamento.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  schemas: [NO_ERRORS_SCHEMA]
})
export class PlanejamentoPage implements OnInit, OnDestroy {
  planejamentoForm: FormGroup;
  planejamentos: Planejamento[] = [];
  receitas: Receita[] = [];

  tiposRefeicaoParaTemplate = ['cafe', 'almoco', 'jantar', 'lanche'];
  tiposRefeicao = TIPOS_REFEICAO;

  getNomeTipoRefeicao(tipo: string): string {
    const tipos: Record<string, string> = {
      'cafe_manha': 'Café da Manhã',
      'almoco': 'Almoço',
      'jantar': 'Jantar',
      'lanche': 'Lanche'
    };
    return tipos[tipo] || tipo;
  }

  dataInicio: Date = new Date();
  dataFim: Date = new Date();
  private subscription: Subscription = new Subscription();
  planejamentoEditando: Planejamento | null = null;

  constructor(
    private fb: FormBuilder,
    private planejamentoService: PlanejamentoService,
    private receitaService: ReceitaService,
    private router: Router,
    private alertController: AlertController
  ) {
    this.planejamentoForm = this.fb.group({
      data: ['', [
        Validators.required,
        (control: AbstractControl): ValidationErrors | null => {
          const data = control.value;
          if (data && !this.validarData(data)) {
            return { dataInvalida: true };
          }
          return null;
        }
      ]],
      refeicao: ['', [Validators.required]],
      receitaId: ['', [Validators.required]],
      observacoes: ['', [Validators.maxLength(200)]]
    });

    this.configurarDatasSemana();
  }

  get data() { return this.planejamentoForm.get('data'); }
  get refeicao() { return this.planejamentoForm.get('refeicao'); }
  get receitaId() { return this.planejamentoForm.get('receitaId'); }
  get observacoes() { return this.planejamentoForm.get('observacoes'); }

  ngOnInit() {
    this.carregarReceitas();
    this.carregarPlanejamentos();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getNomeReceita(receitaId: string): string {
    const receita = this.receitas.find(r => r.id === receitaId);
    return receita ? receita.nome : 'Receita não encontrada';
  }

  private configurarDatasSemana() {
    const hoje = new Date();
    const diaSemana = hoje.getDay();
    
    this.dataInicio = new Date(hoje);
    this.dataInicio.setDate(hoje.getDate() - diaSemana);
    
    this.dataFim = new Date(this.dataInicio);
    this.dataFim.setDate(this.dataFim.getDate() + 6);
  }

  private carregarReceitas() {
    this.subscription.add(
      this.receitaService.listarReceitas().subscribe({
        next: (receitas) => {
          this.receitas = receitas;
        },
        error: (erro) => {
          console.error('Erro ao carregar receitas:', erro);
          this.presentAlert('Erro', 'Erro ao carregar receitas. Tente novamente.');
        }
      })
    );
  }

  private carregarPlanejamentos() {
    const usuarioId = '1'; // Substituir pelo ID do usuário atual
    this.subscription.add(
      this.planejamentoService.listarPlanejamentosPorSemana(
        usuarioId,
        this.dataInicio,
        this.dataFim
      ).subscribe({
        next: (planejamentos) => {
          this.planejamentos = planejamentos;
        },
        error: (erro) => {
          console.error('Erro ao carregar planejamentos:', erro);
          this.presentAlert('Erro', 'Erro ao carregar planejamentos. Verifique o console.');
        }
      })
    );
  }

  formatarDataParaExibicao(data: string | Date): string {
    if (data instanceof Date) {
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      return `${dia}/${mes}/${ano}`;
    }
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  private formatarDataParaAPI(dataString: string): string {
    const [dia, mes, ano] = dataString.split('/');
    return `${ano}-${mes}-${dia}`;
  }

  editarPlanejamento(planejamento: Planejamento) {
    this.planejamentoEditando = planejamento;
    const dataFormatada = planejamento.data ? this.formatarDataParaExibicao(planejamento.data) : '';
    this.planejamentoForm.patchValue({
      data: dataFormatada,
      refeicao: planejamento.refeicao,
      receitaId: planejamento.receitaId,
      observacoes: planejamento.observacoes
    });
  }

  async atualizarPlanejamento() {
    if (this.planejamentoForm.valid && this.planejamentoEditando?.id) {
      const dataFormulario = this.planejamentoForm.value.data;
      const dataFormatada = this.formatarDataParaAPI(dataFormulario);

      const planejamentoAtualizado: Planejamento = {
        ...this.planejamentoForm.value,
        id: this.planejamentoEditando.id,
        usuarioId: '1',
        data: dataFormatada
      };

      if (planejamentoAtualizado.id) {
        this.subscription.add(
          this.planejamentoService.atualizarPlanejamento(planejamentoAtualizado.id, planejamentoAtualizado).subscribe({
            next: () => {
              this.presentAlert('Sucesso', 'Planejamento atualizado com sucesso!');
              this.planejamentoEditando = null;
              this.planejamentoForm.reset();
              this.carregarPlanejamentos();
            },
            error: (erro) => {
              console.error('Erro ao atualizar planejamento:', erro);
              this.presentAlert('Erro', 'Erro ao atualizar planejamento. Tente novamente.');
            }
          })
        );
      }
    }
  }

  cancelarEdicao() {
    this.planejamentoEditando = null;
    this.planejamentoForm.reset();
  }

  onSubmit() {
    if (this.planejamentoEditando) {
      this.atualizarPlanejamento();
    } else {
      if (this.planejamentoForm.valid) {
        const dataFormulario = this.planejamentoForm.value.data;
        const dataFormatada = this.formatarDataParaAPI(dataFormulario);
        
        const planejamento: Planejamento = {
          ...this.planejamentoForm.value,
          usuarioId: '1',
          data: dataFormatada
        };
  
        this.subscription.add(
          this.planejamentoService.cadastrarPlanejamento(planejamento).subscribe({
            next: () => {
              this.presentAlert('Sucesso', 'Planejamento adicionado com sucesso!');
              this.planejamentoForm.reset();
              this.carregarPlanejamentos();
            },
            error: (erro) => {
              console.error('Erro ao criar planejamento:', erro);
              this.presentAlert('Erro', 'Erro ao criar planejamento. Tente novamente.');
            }
          })
        );
      }
    }
  }

  deletarPlanejamento(id: string) {
    if (confirm('Tem certeza que deseja excluir este planejamento?')) {
      this.subscription.add(
        this.planejamentoService.deletarPlanejamento(id).subscribe({
          next: () => {
            this.presentAlert('Sucesso', 'Planejamento excluído com sucesso!');
            this.carregarPlanejamentos();
          },
          error: (erro) => {
            console.error('Erro ao deletar planejamento:', erro);
            this.presentAlert('Erro', 'Erro ao deletar planejamento. Tente novamente.');
          }
        })
      );
    }
  }

  avancarSemana() {
    this.dataInicio.setDate(this.dataInicio.getDate() + 7);
    this.dataFim.setDate(this.dataFim.getDate() + 7);
    this.carregarPlanejamentos();
  }

  voltarSemana() {
    this.dataInicio.setDate(this.dataInicio.getDate() - 7);
    this.dataFim.setDate(this.dataFim.getDate() - 7);
    this.carregarPlanejamentos();
  }

  async confirmarExclusao(planejamentoId: number | string | undefined) {
    if (planejamentoId === undefined || planejamentoId === null) {
      console.error('ID do planejamento não fornecido para exclusão.');
      this.presentAlert('Erro', 'Não foi possível excluir o planejamento: ID não encontrado.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir este planejamento?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Excluir',
          handler: () => {
            this.deletarPlanejamento(String(planejamentoId));
          },
        },
      ],
    });

    await alert.present();
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  private validarData(dataString: string): boolean {
    const [dia, mes, ano] = dataString.split('/').map(Number);
    
    // Verifica se os valores são números válidos
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return false;
    
    // Verifica limites básicos
    if (dia < 1 || dia > 31) return false;
    if (mes < 1 || mes > 12) return false;
    if (ano < 1900 || ano > 2100) return false;
    
    // Verifica meses com 30 dias
    if ([4, 6, 9, 11].includes(mes) && dia > 30) return false;
    
    // Verifica fevereiro
    if (mes === 2) {
      const isBissexto = (ano % 4 === 0 && ano % 100 !== 0) || (ano % 400 === 0);
      if (isBissexto && dia > 29) return false;
      if (!isBissexto && dia > 28) return false;
    }
    
    return true;
  }

  formatarData(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 0) {
      if (value.length <= 2) {
        value = value;
      } else if (value.length <= 4) {
        value = value.substring(0, 2) + '/' + value.substring(2);
      } else {
        value = value.substring(0, 2) + '/' + value.substring(2, 4) + '/' + value.substring(4, 8);
      }
    }
    event.target.value = value;
  }
} 