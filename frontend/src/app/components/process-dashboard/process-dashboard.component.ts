import { Component, OnInit } from '@angular/core';
import { ProcessService } from '../../services/process.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-process-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './process-dashboard.component.html',
  styleUrl: './process-dashboard.component.css',
})
export class ProcessDashboardComponent implements OnInit {
  processes: any[] = [];
  newProcess: any = { name: '', description: '' };
  selectedHistory: any[] | null = null;

  constructor(private processService: ProcessService) {}

  ngOnInit(): void {
    this.loadProcesses();
  }

  loadProcesses(): void {
    this.processService.getProcesses().subscribe({
      next: (data) => {
        console.log('Processes loaded successfully:', data);
        this.processes = data;
      },
      error: (error) => {
        console.error('Error loading processes:', error);
        this.processes = [];
      }
    });
  }

  createProcess(): void {
    this.processService.createProcess(this.newProcess).subscribe({
      next: () => {
        console.log('Process created successfully');
        this.loadProcesses();
        this.newProcess = { name: '', description: '' };
      },
      error: (error) => {
        console.error('Error creating process:', error);
      }
    });
  }

  showHistory(processId: number): void {
    this.processService.getProcessHistory(processId).subscribe({
      next: (data) => {
        console.log('History loaded successfully:', data);
        this.selectedHistory = data;
      },
      error: (error) => {
        console.error('Error loading history:', error);
        this.selectedHistory = null;
      }
    });
  }
}
