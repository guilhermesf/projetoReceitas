import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditarReceitaPage } from './editar-receita.page';

const routes: Routes = [
  {
    path: ':id',
    component: EditarReceitaPage
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class EditarReceitaPageModule {} 