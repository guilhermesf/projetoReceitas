import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CadastroNovoPage } from './cadastro-novo.page';

const routes: Routes = [
  {
    path: '',
    component: CadastroNovoPage
  }
];

@NgModule({
  declarations: [CadastroNovoPage],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class CadastroNovoPageModule {}