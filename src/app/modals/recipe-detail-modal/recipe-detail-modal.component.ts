import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { ReceitaService } from '../../services/receita.service';
import { Receita } from '../../models/receita.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-recipe-detail-modal',
  templateUrl: './recipe-detail-modal.component.html',
  styleUrls: ['./recipe-detail-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class RecipeDetailModalComponent implements OnInit {
  @Input() recipeId: string | undefined; // Receberá o ID da receita
  recipe: Receita | undefined;
  isLoading = true;
  error: string | null = null;

  constructor(private modalController: ModalController, private receitaService: ReceitaService) { }

  ngOnInit() {
    if (this.recipeId) {
      this.loadRecipeDetails(this.recipeId);
    } else {
      this.error = 'ID da receita não fornecido.';
      this.isLoading = false;
    }
  }

  async loadRecipeDetails(id: string) {
    this.isLoading = true;
    this.error = null;
    try {
      this.recipe = await firstValueFrom(this.receitaService.buscarReceita(id));
    } catch (err) {
      console.error('Erro ao carregar detalhes da receita:', err);
      this.error = 'Não foi possível carregar os detalhes da receita.';
    } finally {
      this.isLoading = false;
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }
} 