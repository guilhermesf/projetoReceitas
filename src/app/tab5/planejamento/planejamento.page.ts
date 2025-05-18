import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlanejamentoService } from '../../services/planejamento.service';
import { ReceitaService } from '../../services/receita.service';
import { Planejamento, TIPOS_REFEICAO, TipoRefeicao } from '../../models/planejamento.model';
import { Receita } from '../../models/receita.model';
import { Subscription } from 'rxjs';
import { MaskitoDirective } from '@maskito/angular';
import { maskitoDateOptionsGenerator } from '@maskito/kit';
import { MaskitoOptions } from '@maskito/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-planejamento',
  templateUrl: './planejamento.page.html',
  styleUrls: ['./planejamento.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, MaskitoDirective],
  schemas: [NO_ERRORS_SCHEMA]
})
export class PlanejamentoPage implements OnInit, OnDestroy {
  planejamentoForm: FormGroup;
  planejamentos: Planejamento[] = [];
  receitas: Receita[] = [];
  readonly dateMask: MaskitoOptions = maskitoDateOptionsGenerator({ mode: 'dd/mm/yyyy' });

  tiposRefeicaoParaTemplate = ['cafe', 'almoco', 'jantar', 'lanche'];
  tiposRefeicao = TIPOS_REFEICAO;

  getNomeTipoRefeicao(tipo: string): string {
    return this.tiposRefeicao[tipo as keyof typeof TIPOS_REFEICAO] || tipo;
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
      data: ['', [Validators.required]],
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

  editarPlanejamento(planejamento: Planejamento) {
    this.planejamentoEditando = planejamento;
    const dataFormatada = planejamento.data ? new Date(planejamento.data).toLocaleDateString('pt-BR') : '';
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
      const dataObj = dataFormulario ? new Date(dataFormulario.split('/').reverse().join('-')) : undefined;

      const planejamentoAtualizado: Planejamento = {
        ...this.planejamentoForm.value,
        id: this.planejamentoEditando.id,
        usuarioId: '1',
        data: dataObj ? dataObj.toISOString() : this.planejamentoEditando.data
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
      } else {
        console.error('ID do planejamento não encontrado para atualização.');
        this.presentAlert('Erro', 'Não foi possível atualizar o planejamento: ID não encontrado.');
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
        const planejamento: Planejamento = {
          ...this.planejamentoForm.value,
          usuarioId: '1'
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
} 