import { Employee } from './employee-model';

export interface EmployeeProjectOverlapModel {
    firstEmployee: Employee;
    secondEmployee: Employee;
    projectId: string;
    daysWorkedOnProjectTogether: number;
}