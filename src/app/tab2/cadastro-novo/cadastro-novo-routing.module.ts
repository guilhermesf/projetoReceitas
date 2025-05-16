import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CadastroNovoPage } from './cadastro-novo.page';

const routes: Routes = [
  {
    path: '',
    component: CadastroNovoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CadastroNovoPageRoutingModule {}
