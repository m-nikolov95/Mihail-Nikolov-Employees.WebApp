import { EmployeeProjectOverlapModel } from './employee-project-overlap-model';

export interface TeamWithMostWorkingDaysModel {
    team: EmployeeProjectOverlapModel[];
    totalDaysWorkedTogether: number;
}