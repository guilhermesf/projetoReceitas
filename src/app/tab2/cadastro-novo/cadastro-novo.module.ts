import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CadastroNovoPageRoutingModule } from './cadastro-novo-routing.module';
import { CadastroNovoPage } from './cadastro-novo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CadastroNovoPageRoutingModule,
    CadastroNovoPage
  ]
})
export class CadastroNovoPageModule {}