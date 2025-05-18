import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PlanejamentoPageRoutingModule } from './planejamento-routing.module';
import { PlanejamentoPage } from './planejamento.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlanejamentoPageRoutingModule,
    ReactiveFormsModule,
    PlanejamentoPage
  ],
  declarations: []
})
export class PlanejamentoPageModule {} 