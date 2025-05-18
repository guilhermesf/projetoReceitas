import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { ReceitaService } from '../../services/receita.service';
import { Receita } from '../../models/receita.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-modal-detalhe-receita',
  templateUrl: './modal-detalhe-receita.component.html',
  styleUrls: ['./modal-detalhe-receita.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ModalDetalheReceitaComponent implements OnInit {
  @Input() receitaId: string | undefined;
  receita: Receita | undefined;
  carregando = true;
  erro: string | null = null;

  constructor(private modalController: ModalController, private receitaService: ReceitaService) { }

  ngOnInit() {
    if (this.receitaId) {
      this.carregarDetalhesReceita(this.receitaId);
    } else {
      this.erro = 'ID da receita não fornecido.';
      this.carregando = false;
    }
  }

  async carregarDetalhesReceita(id: string) {
    this.carregando = true;
    this.erro = null;
    try {
      this.receita = await firstValueFrom(this.receitaService.buscarReceita(id));
    } catch (err) {
      console.error('Erro ao carregar detalhes da receita:', err);
      this.erro = 'Não foi possível carregar os detalhes da receita.';
    } finally {
      this.carregando = false;
    }
  }

  fecharModal() {
    this.modalController.dismiss();
  }
} 