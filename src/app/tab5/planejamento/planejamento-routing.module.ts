import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanejamentoPage } from './planejamento.page';

const routes: Routes = [
  {
    path: '',
    component: PlanejamentoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanejamentoPageRoutingModule {} 