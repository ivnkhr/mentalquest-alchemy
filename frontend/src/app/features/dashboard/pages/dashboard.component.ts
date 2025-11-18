import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonFab,
  IonFabButton,
  IonFabList,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, logOutOutline, trophyOutline, diamondOutline, listOutline } from 'ionicons/icons';
import { Rock, RockStatus } from 'shared/types';
import { loadRocks } from '../../rocks/store/rocks.actions';
import { logout } from '../../../core/auth/store/auth.actions';
import { selectAllRocks, selectActiveRocks, selectGems } from '../../rocks/store/rocks.selectors';

interface DashboardStats {
  totalRocks: number;
  activeRocks: number;
  gems: number;
  archivedRocks: number;
  totalProgress: number;
  completionRate: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonFab,
    IonFabButton,
    IonFabList,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="onLogout()">
            <ion-icon name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (stats$ | async; as stats) {
        <!-- Statistics Cards -->
        <ion-grid>
          <ion-row>
            <ion-col size="6" size-md="3">
              <ion-card color="primary" button (click)="navigateToRocks()">
                <ion-card-header>
                  <ion-card-title>{{ stats.activeRocks }}</ion-card-title>
                  <ion-card-subtitle>Active Rocks</ion-card-subtitle>
                </ion-card-header>
              </ion-card>
            </ion-col>

            <ion-col size="6" size-md="3">
              <ion-card color="success" button (click)="navigateToGems()">
                <ion-card-header>
                  <ion-card-title>{{ stats.gems }}</ion-card-title>
                  <ion-card-subtitle>Gems</ion-card-subtitle>
                </ion-card-header>
              </ion-card>
            </ion-col>

            <ion-col size="6" size-md="3">
              <ion-card>
                <ion-card-header>
                  <ion-card-title>{{ stats.totalProgress.toFixed(0) }}%</ion-card-title>
                  <ion-card-subtitle>Avg Progress</ion-card-subtitle>
                </ion-card-header>
              </ion-card>
            </ion-col>

            <ion-col size="6" size-md="3">
              <ion-card>
                <ion-card-header>
                  <ion-card-title>{{ stats.completionRate.toFixed(0) }}%</ion-card-title>
                  <ion-card-subtitle>Completion Rate</ion-card-subtitle>
                </ion-card-header>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <!-- Recent Activity -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Recent Rocks</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            @if (recentRocks$ | async; as recentRocks) {
              @if (recentRocks.length > 0) {
                <ion-list>
                  @for (rock of recentRocks; track rock.id) {
                    <ion-item button (click)="navigateToRock(rock.id)">
                      <ion-label>
                        <h3>{{ rock.title }}</h3>
                        <p>Progress: {{ rock.progress }}%</p>
                      </ion-label>
                      <ion-badge slot="end" [color]="getBadgeColor(rock.status)">
                        {{ rock.status }}
                      </ion-badge>
                    </ion-item>
                  }
                </ion-list>
              } @else {
                <p class="ion-text-center ion-padding">No rocks yet. Create one to get started!</p>
              }
            }
          </ion-card-content>
        </ion-card>

        <!-- Quick Actions -->
        <ion-fab slot="fixed" vertical="bottom" horizontal="end">
          <ion-fab-button>
            <ion-icon name="add"></ion-icon>
          </ion-fab-button>
          <ion-fab-list side="top">
            <ion-fab-button (click)="createNewRock()" color="primary">
              <ion-icon name="diamond-outline"></ion-icon>
            </ion-fab-button>
            <ion-fab-button (click)="viewAllRocks()" color="secondary">
              <ion-icon name="list-outline"></ion-icon>
            </ion-fab-button>
          </ion-fab-list>
        </ion-fab>
      }
    </ion-content>
  `,
  styles: [
    `
      ion-card-title {
        font-size: 2rem;
        font-weight: bold;
      }

      ion-card-subtitle {
        font-size: 0.875rem;
        margin-top: 0.5rem;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  stats$!: Observable<DashboardStats>;
  recentRocks$!: Observable<Rock[]>;

  constructor() {
    addIcons({ add, logOutOutline, trophyOutline, diamondOutline, listOutline });
  }

  ngOnInit() {
    this.store.dispatch(loadRocks());

    // Calculate statistics
    this.stats$ = this.store.select(selectAllRocks).pipe(
      map((rocks) => {
        const activeRocks = rocks.filter((r) => r.status === RockStatus.ACTIVE).length;
        const gems = rocks.filter((r) => r.status === RockStatus.GEM).length;
        const archivedRocks = rocks.filter((r) => r.status === RockStatus.ARCHIVED).length;
        const totalRocks = rocks.length;

        const totalProgress =
          rocks.length > 0
            ? rocks.reduce((sum, rock) => sum + rock.progress, 0) / rocks.length
            : 0;

        const completionRate = totalRocks > 0 ? (gems / totalRocks) * 100 : 0;

        return {
          totalRocks,
          activeRocks,
          gems,
          archivedRocks,
          totalProgress,
          completionRate,
        };
      })
    );

    // Get recent rocks (most recently updated)
    this.recentRocks$ = this.store.select(selectAllRocks).pipe(
      map((rocks) => {
        return [...rocks]
          .sort((a, b) => {
            const dateA = new Date(a.updated_at).getTime();
            const dateB = new Date(b.updated_at).getTime();
            return dateB - dateA;
          })
          .slice(0, 5);
      })
    );
  }

  getBadgeColor(status: RockStatus): string {
    switch (status) {
      case RockStatus.ACTIVE:
        return 'primary';
      case RockStatus.GEM:
        return 'success';
      case RockStatus.ARCHIVED:
        return 'medium';
      default:
        return 'medium';
    }
  }

  navigateToRocks() {
    this.router.navigate(['/rocks']);
  }

  navigateToGems() {
    this.router.navigate(['/rocks'], { queryParams: { status: RockStatus.GEM } });
  }

  navigateToRock(id: string) {
    this.router.navigate(['/rocks', id]);
  }

  createNewRock() {
    this.router.navigate(['/rocks/new']);
  }

  viewAllRocks() {
    this.router.navigate(['/rocks']);
  }

  onLogout() {
    this.store.dispatch(logout());
  }
}
