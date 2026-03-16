import { Component, OnInit }  from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router }              from '@angular/router';
import { MatSnackBar }         from '@angular/material/snack-bar';
import { PublicComplaintService, ResidentComplaintService } from '../../services/cms.services';
import { CategoryResponse, ComplaintPriority } from '../../models/cms.models';

@Component({
  standalone: false,
  selector: 'vp-submit-complaint',
  templateUrl: './submit-complaint.component.html',
  styleUrls: ['./submit-complaint.component.scss']
})
export class SubmitComplaintComponent implements OnInit {

  form!:         FormGroup;
  categories:    CategoryResponse[] = [];
  evidenceFiles: File[]             = [];
  loading        = false;
  step           = 1;  // 1=details, 2=evidence, 3=review

  readonly priorities: ComplaintPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  readonly wards = Array.from({ length: 20 }, (_, i) => i + 1);

  constructor(
    private fb:       FormBuilder,
    private pubSvc:   PublicComplaintService,
    private resSvc:   ResidentComplaintService,
    private router:   Router,
    private snack:    MatSnackBar
  ) {}

  ngOnInit(): void {
    this.pubSvc.getCategories().subscribe(res => this.categories = res.data);
    this.form = this.fb.group({
      categoryId:         [null, Validators.required],
      wardNumber:         [null, Validators.required],
      titleEn:            ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      titleHi:            [''],
      descriptionEn:      ['', [Validators.required, Validators.minLength(20), Validators.maxLength(5000)]],
      descriptionHi:      [''],
      locationText:       ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
      latitude:           [null, [Validators.min(-90), Validators.max(90)]],
      longitude:          [null, [Validators.min(-180), Validators.max(180)]],
      priority:           ['MEDIUM'],
      isAnonymousDisplay: [false],
    });
  }

  get f(): { [k: string]: AbstractControl } { return this.form.controls; }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const newFiles = Array.from(input.files);
    const combined = [...this.evidenceFiles, ...newFiles];
    if (combined.length > 5) {
      this.snack.open('Maximum 5 evidence files allowed.', 'OK', { duration: 3000 });
      return;
    }
    this.evidenceFiles = combined;
  }

  removeFile(index: number): void {
    this.evidenceFiles.splice(index, 1);
  }

  nextStep(): void {
    if (this.step === 1 && this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.step++;
  }

  prevStep(): void { if (this.step > 1) this.step--; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.resSvc.submit(this.form.value).subscribe({
      next: res => {
        const id  = res.data.id;
        const num = res.data.complaintNumber;
        if (this.evidenceFiles.length > 0) {
          this.resSvc.uploadEvidence(id, this.evidenceFiles).subscribe({
            complete: () => this.onSuccess(num),
            error:    () => this.onSuccess(num)   // navigate even if upload fails
          });
        } else {
          this.onSuccess(num);
        }
      },
      error: err => {
        this.loading = false;
        this.snack.open(err.error?.message ?? 'Failed to submit complaint.', 'Dismiss', { duration: 5000 });
      }
    });
  }

  private onSuccess(num: string): void {
    this.loading = false;
    this.snack.open(`Complaint ${num} submitted successfully!`, 'View', { duration: 8000 })
      .onAction().subscribe(() => this.router.navigate(['/complaints', num]));
    this.router.navigate(['/complaints', num]);
  }

  getFileSizeMB(file: File): string {
    return (file.size / 1024 / 1024).toFixed(2);
  }

  getFileNames(): string {
    return this.evidenceFiles.map(f => f.name).join(', ');
  }

  getSelectedCategoryName(): string {
    const id = this.form.value.categoryId;
    return this.categories.find(c => c.id === id)?.nameEn ?? '';
  }
}
