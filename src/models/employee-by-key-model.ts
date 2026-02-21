import { Employee } from './employee-model';

export interface EmployeesByKeyModel {
    [projectId: string]: Employee[];
}