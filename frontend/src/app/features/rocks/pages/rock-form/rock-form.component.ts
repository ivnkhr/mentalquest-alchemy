import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
} from '@ionic/angular/standalone';
import { createRock, updateRock, loadRockDetail } from '../../store/rocks.actions';
import { selectSelectedRock } from '../../store/rocks.selectors';

@Component({
  selector: 'app-rock-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/rocks"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEditMode ? 'Edit' : 'New' }} Rock</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="onSave()" [disabled]="rockForm.invalid">
            Save
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="rockForm">
        <ion-item>
          <ion-label position="floating">Title</ion-label>
          <ion-input type="text" formControlName="title" placeholder="Enter rock title"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="floating">Description</ion-label>
          <ion-textarea
            formControlName="description"
            placeholder="Enter description (optional)"
            [autoGrow]="true"
          ></ion-textarea>
        </ion-item>
      </form>
    </ion-content>
  `,
})
export class RockFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  rockForm: FormGroup;
  isEditMode = false;
  rockId: string | null = null;

  constructor() {
    this.rockForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
    });
  }

  ngOnInit() {
    this.rockId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.rockId;

    if (this.isEditMode && this.rockId) {
      this.store.dispatch(loadRockDetail({ id: this.rockId }));
      this.store.select(selectSelectedRock).subscribe((rock) => {
        if (rock) {
          this.rockForm.patchValue({
            title: rock.title,
            description: rock.description || '',
          });
        }
      });
    }
  }

  onSave() {
    if (this.rockForm.valid) {
      if (this.isEditMode && this.rockId) {
        this.store.dispatch(updateRock({ id: this.rockId, rock: this.rockForm.value }));
      } else {
        this.store.dispatch(createRock({ rock: this.rockForm.value }));
      }
    }
  }
}
