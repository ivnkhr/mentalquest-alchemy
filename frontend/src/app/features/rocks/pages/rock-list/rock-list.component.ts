import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonFab,
  IonFabButton,
  IonIcon,
  IonList,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, logOutOutline } from 'ionicons/icons';
import { RockStatus } from 'shared/types';
import { RockCardComponent } from '../../components/rock-card/rock-card.component';
import { loadRocks } from '../../store/rocks.actions';
import { logout } from '../../../../core/auth/store/auth.actions';
import {
  selectActiveRocks,
  selectGems,
  selectArchivedRocks,
  selectLoading,
} from '../../store/rocks.selectors';

@Component({
  selector: 'app-rock-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RockCardComponent,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonFab,
    IonFabButton,
    IonIcon,
    IonList,
    IonSpinner,
    IonCard,
    IonCardContent,
    IonButton,
    IonButtons,
  ],
  templateUrl: './rock-list.component.html',
  styleUrls: ['./rock-list.component.scss'],
})
export class RockListComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  selectedSegment: RockStatus = RockStatus.ACTIVE;
  RockStatus = RockStatus;

  activeRocks$ = this.store.select(selectActiveRocks);
  gems$ = this.store.select(selectGems);
  archivedRocks$ = this.store.select(selectArchivedRocks);
  loading$ = this.store.select(selectLoading);

  constructor() {
    addIcons({ add, logOutOutline });
  }

  ngOnInit() {
    this.store.dispatch(loadRocks());
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
  }

  onRockClick(rockId: string) {
    this.router.navigate(['/rocks', rockId]);
  }

  onAddRock() {
    this.router.navigate(['/rocks/new']);
  }

  onLogout() {
    this.store.dispatch(logout());
  }
}
