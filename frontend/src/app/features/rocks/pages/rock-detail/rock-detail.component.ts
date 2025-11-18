import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonProgressBar,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonSpinner,
} from '@ionic/angular/standalone';
import { loadRockDetail, loadEdges, updateEdge } from '../../store/rocks.actions';
import { selectSelectedRock, selectEdges, selectLoading } from '../../store/rocks.selectors';

@Component({
  selector: 'app-rock-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardContent,
    IonProgressBar,
    IonList,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonSpinner,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/rocks"></ion-back-button>
        </ion-buttons>
        <ion-title>Rock Details</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (loading$ | async) {
        <div class="loading-container">
          <ion-spinner></ion-spinner>
        </div>
      }

      @if (rock$ | async; as rock) {
        <ion-card>
          <ion-card-content>
            <h2>{{ rock.title }}</h2>
            @if (rock.description) {
              <p>{{ rock.description }}</p>
            }
            <div class="progress-section">
              <div class="progress-text">
                <span>Progress</span>
                <span>{{ rock.progress }}%</span>
              </div>
              <ion-progress-bar [value]="rock.progress / 100"></ion-progress-bar>
            </div>
          </ion-card-content>
        </ion-card>

        <h3>Edges</h3>
        <ion-list>
          @for (edge of edges$ | async; track edge.id) {
            <ion-item>
              <ion-checkbox
                [(ngModel)]="edge.is_completed"
                (ionChange)="onEdgeToggle(edge.id, edge.is_completed)"
                slot="start"
              ></ion-checkbox>
              <ion-label>{{ edge.title }}</ion-label>
            </ion-item>
          } @empty {
            <ion-item>
              <ion-label>No edges yet. Create one to track progress!</ion-label>
            </ion-item>
          }
        </ion-list>
      }
    </ion-content>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
    .progress-section {
      margin-top: 1rem;
    }
    .progress-text {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    h3 {
      margin: 1.5rem 0 1rem;
    }
  `],
})
export class RockDetailComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);

  rock$ = this.store.select(selectSelectedRock);
  edges$ = this.store.select(selectEdges);
  loading$ = this.store.select(selectLoading);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.dispatch(loadRockDetail({ id }));
      this.store.dispatch(loadEdges({ rockId: id }));
    }
  }

  onEdgeToggle(edgeId: string, isCompleted: boolean) {
    this.store.dispatch(updateEdge({ id: edgeId, edge: { is_completed: isCompleted } }));
  }
}
