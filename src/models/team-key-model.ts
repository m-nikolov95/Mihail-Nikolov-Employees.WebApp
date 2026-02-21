import { EmployeeProjectOverlapModel } from './employee-project-overlap-model';

export interface TeamKeyModel {
    [teamKey: string]: EmployeeProjectOverlapModel[]
}