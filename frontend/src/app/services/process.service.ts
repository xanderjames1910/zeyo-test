import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProcessService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getProcesses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/processes`);
  }

  createProcess(process: {
    name: string;
    description: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/processes`, process);
  }

  getProcessHistory(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/processes/${id}/history`);
  }
}
