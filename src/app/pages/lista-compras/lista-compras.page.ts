import { Component, OnInit } from '@angular/core';
import { ListaComprasService } from '../../services/lista-compras.service';
import { ItemListaCompras } from '../../models/lista-compras.model';
import { AlertController, ToastController, IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-lista-compras',
  templateUrl: './lista-compras.page.html',
  styleUrls: ['./lista-compras.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class ListaComprasPage implements OnInit {
  itens: ItemListaCompras[] = [];
  novoItem: ItemListaCompras = {
    nome: '',
    quantidade: 1,
    unidade: 'un',
    comprado: false,
    dataValidade: '',
    prioridade: 'media'
  };
  itemEditando: ItemListaCompras | null = null;
  itemForm: FormGroup;

  constructor(
    private listaComprasService: ListaComprasService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private formBuilder: FormBuilder
  ) {
    this.itemForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      unidade: ['un', Validators.required],
      comprado: [false],
      dataValidade: [''],
      prioridade: ['media', Validators.required]
    });
  }

  ngOnInit() {
    this.carregarItens();
  }

  carregarItens() {
    this.listaComprasService.listarItens().subscribe(
      (itens) => {
        this.itens = itens;
      },
      (erro) => {
        this.mostrarMensagem('Erro ao carregar itens');
      }
    );
  }

  async adicionarItem() {
    if (!this.novoItem.nome) {
      this.mostrarMensagem('Por favor, insira o nome do item');
      return;
    }

    if (!this.validarData(this.novoItem.dataValidade)) {
      this.mostrarMensagem('Por favor, insira uma data válida');
      return;
    }

    this.listaComprasService.adicionarItem(this.novoItem).subscribe(
      () => {
        this.carregarItens();
        this.novoItem = {
          nome: '',
          quantidade: 1,
          unidade: 'un',
          comprado: false,
          dataValidade: '',
          prioridade: 'media'
        };
        this.mostrarMensagem('Item adicionado com sucesso!');
      },
      (erro) => {
        this.mostrarMensagem('Erro ao adicionar item');
      }
    );
  }

  editarItem(item: ItemListaCompras) {
    this.itemEditando = item;
    this.itemForm.patchValue({
      nome: item.nome,
      quantidade: item.quantidade,
      unidade: item.unidade,
      comprado: item.comprado,
      dataValidade: item.dataValidade || '',
      prioridade: item.prioridade || 'media'
    });
  }

  atualizarItem() {
    if (this.itemForm.valid && this.itemEditando?.id) {
      const dataValidade = this.itemForm.get('dataValidade')?.value;
      
      if (!this.validarData(dataValidade)) {
        this.mostrarMensagem('Por favor, insira uma data válida');
        return;
      }

      const itemAtualizado = {
        ...this.itemForm.value,
        id: this.itemEditando.id
      };

      this.listaComprasService.atualizarItem(this.itemEditando.id, itemAtualizado).subscribe(
        () => {
          this.carregarItens();
          this.itemEditando = null;
          this.itemForm.reset();
          this.mostrarMensagem('Item atualizado com sucesso!');
        },
        (erro) => {
          this.mostrarMensagem('Erro ao atualizar item');
        }
      );
    }
  }

  async removerItem(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar exclusão',
      message: 'Tem certeza que deseja remover este item?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          handler: () => {
            this.listaComprasService.removerItem(id).subscribe(
              () => {
                this.carregarItens();
                this.mostrarMensagem('Item removido com sucesso!');
              },
              (erro) => {
                this.mostrarMensagem('Erro ao remover item');
              }
            );
          }
        }
      ]
    });

    await alert.present();
  }

  alternarEstadoComprado(item: ItemListaCompras) {
    if (item.id) {
      this.listaComprasService.alternarEstadoComprado(item.id, !item.comprado).subscribe(
        () => {
          this.carregarItens();
        },
        (erro) => {
          this.mostrarMensagem('Erro ao atualizar item');
        }
      );
    }
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

  formatarDataInput(event: any, tipo: 'novo' | 'edit') {
    let valor = event.detail.value.replace(/\D/g, '');
    
    if (valor.length > 0) {
      if (valor.length <= 2) {
        valor = valor;
      } else if (valor.length <= 4) {
        valor = valor.substring(0, 2) + '/' + valor.substring(2);
      } else {
        valor = valor.substring(0, 2) + '/' + valor.substring(2, 4) + '/' + valor.substring(4, 8);
      }
    }

    if (tipo === 'novo') {
      this.novoItem.dataValidade = valor;
    } else {
      this.itemForm.patchValue({
        dataValidade: valor
      });
    }
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

  private async mostrarMensagem(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
} 