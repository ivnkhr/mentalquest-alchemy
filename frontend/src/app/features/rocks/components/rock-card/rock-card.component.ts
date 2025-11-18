import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonProgressBar,
} from '@ionic/angular/standalone';
import { Rock, RockStatus } from 'shared/types';

@Component({
  selector: 'app-rock-card',
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonProgressBar,
  ],
  templateUrl: './rock-card.component.html',
  styleUrls: ['./rock-card.component.scss'],
})
export class RockCardComponent {
  @Input() rock!: Rock;

  get statusColor(): string {
    switch (this.rock.status) {
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

  get statusLabel(): string {
    return this.rock.status.charAt(0).toUpperCase() + this.rock.status.slice(1);
  }

  get progressValue(): number {
    return Number(this.rock.progress) / 100;
  }
}
