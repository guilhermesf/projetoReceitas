import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditarCategoriaPage } from './editar-categoria.page';

const routes: Routes = [
  {
    path: ':id',
    component: EditarCategoriaPage
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class EditarCategoriaPageModule {} 