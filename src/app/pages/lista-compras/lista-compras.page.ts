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
    comprado: false
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
      comprado: [false]
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

    this.listaComprasService.adicionarItem(this.novoItem).subscribe(
      () => {
        this.carregarItens();
        this.novoItem = {
          nome: '',
          quantidade: 1,
          unidade: 'un',
          comprado: false
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
      comprado: item.comprado
    });
  }

  atualizarItem() {
    if (this.itemForm.valid && this.itemEditando?.id) {
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

  private async mostrarMensagem(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
} 