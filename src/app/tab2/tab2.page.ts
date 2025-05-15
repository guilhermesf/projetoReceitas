import { Component, OnInit } from '@angular/core';
import { ReceitaService } from '../services/receita.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  receitas: any[] = [];

  constructor(private receitaService: ReceitaService) {}

  //tem diferença entre ngOnInit e ionViewWillEnter - ngOnInit é chamado quando o componente é criado, 
  //e ionViewWillEnter é chamado quando o componente é exibido
  
  ngOnInit() {
    this.carregarReceitas(); 
  }

  ionViewWillEnter() {
    this.carregarReceitas(); //busca do banco de dados - dados atualizados  
  }

  carregarReceitas() {
    this.receitaService.listarReceitas().subscribe({
      next: (data) => {
        this.receitas = data;
      },
      error: (error) => {
        console.error('Erro ao carregar receitas:', error);
      }
    });
  }

  deletarReceita(id: string) {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      this.receitaService.deletarReceita(id).subscribe({
        next: () => {
          this.carregarReceitas();
          alert('Receita excluída com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao excluir receita:', error);
          alert('Erro ao excluir receita. Tente novamente.');
        }
      });
    }
  }
}
