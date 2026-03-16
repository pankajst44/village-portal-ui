import { Component, OnInit } from '@angular/core';
import { ResidentComplaintService } from '../../services/cms.services';
import { ComplaintSummaryResponse } from '../../models/cms.models';
import { PageEvent } from '@angular/material/paginator';

@Component({
  standalone: false,
  selector: 'vp-my-complaints',
  templateUrl: './my-complaints.component.html',
  styleUrls: ['./my-complaints.component.scss']
})
export class MyComplaintsComponent implements OnInit {

  complaints: ComplaintSummaryResponse[] = [];
  loading  = false;
  total    = 0;
  page     = 0;
  pageSize = 10;

  constructor(private svc: ResidentComplaintService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.myComplaints(this.page, this.pageSize).subscribe({
      next: res => {
        this.complaints = res.data.content;
        this.total      = res.data.totalElements;
        this.loading    = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onPage(e: PageEvent): void {
    this.page = e.pageIndex; this.pageSize = e.pageSize; this.load();
  }
}
