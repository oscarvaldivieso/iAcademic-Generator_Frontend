import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CareerSubject } from 'src/app/Modelos/uni/career-subject.model';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { SubjectService } from 'src/app/core/services/subject.service';

interface GroupedYearSubjects {
  year: number;
  subjects: CareerSubject[];
}

@Component({
  selector: 'app-plan-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plan-subjects.component.html',
  styleUrls: ['./plan-subjects.component.scss']
})
export class PlanSubjectsComponent implements OnInit {
  isLoading = false;
  errorMessage = '';
  groupedByYear: GroupedYearSubjects[] = [];
  totalSubjects = 0;
  totalUv = 0;

  constructor(
    private subjectService: SubjectService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.loadCareerPlan();
  }

  private loadCareerPlan(): void {
    const currentUser = this.authService.currentUserValue;

    if (!currentUser) {
      this.errorMessage = 'Debes iniciar sesión para ver tu plan de materias.';
      return;
    }

    const studentId = currentUser.usu_codigo;
    const careerCode = currentUser.car_codigo;

    this.isLoading = true;
    this.subjectService.getCareerSubjects(studentId, careerCode).subscribe({
      next: (response) => {
        console.log('career-subjects raw response', response);

        if (response && response.success && Array.isArray(response.data)) {
          const safeSubjects = (response.data as CareerSubject[]).filter(
            (s) => !!s
          );

          this.totalSubjects = safeSubjects.length;
          this.totalUv = safeSubjects.reduce(
            (acc: number, subject: CareerSubject) =>
              acc + (subject?.mat_unidades_valorativas ?? 0),
            0
          );
          this.groupedByYear = this.buildGroupedByYear(safeSubjects);
        } else {
          this.errorMessage =
            (response && (response as any).message) ||
            'No se pudo cargar el plan de materias.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el plan de materias:', error);
        this.errorMessage =
          'Ocurrió un error al cargar tu plan de materias. Inténtalo nuevamente.';
        this.isLoading = false;
      }
    });
  }

  onSaveProgress(): void {
  }

  private buildGroupedByYear(subjects: CareerSubject[]): GroupedYearSubjects[] {
    const byYear = new Map<number, CareerSubject[]>();

    for (const subject of subjects) {
      if (!subject) {
        continue;
      }

      const year =
        subject.mat_anio_carrera != null
          ? subject.mat_anio_carrera
          : subject.mat_anio ?? 0;
      if (!byYear.has(year)) {
        byYear.set(year, []);
      }
      byYear.get(year)!.push(subject);
    }

    return Array.from(byYear.entries())
      .map(([year, list]) => ({
        year,
        subjects: list
          .filter((s) => !!s)
          .sort((a, b) => {
            const orderA = a.mat_orden ?? 999;
            const orderB = b.mat_orden ?? 999;

            if (orderA !== orderB) {
              return orderA - orderB;
            }

            const nameA = a.mat_nombre || '';
            const nameB = b.mat_nombre || '';
            return nameA.localeCompare(nameB);
          })
      }))
      .sort((a, b) => a.year - b.year);
  }

  private flattenSubjects(): CareerSubject[] {
    return this.groupedByYear.reduce<CareerSubject[]>(
      (acc, group) => acc.concat(group.subjects),
      []
    );
  }

  getCompletedCount(): number {
    return this.flattenSubjects().filter((s) => s.cursada).length;
  }

  getAvailableCount(): number {
    return this.flattenSubjects().filter((s) => !s.cursada && s.puede_cursar)
      .length;
  }

  getLockedCount(): number {
    return this.flattenSubjects().filter((s) => !s.cursada && !s.puede_cursar)
      .length;
  }
}
