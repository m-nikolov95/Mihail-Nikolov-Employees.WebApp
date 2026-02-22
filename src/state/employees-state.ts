import { EmployeeProjectOverlapModel } from '../models/employee-project-overlap-model';

export class EmployeesState {
    collaboratingEmployees: EmployeeProjectOverlapModel[];

    constructor() {
        this.collaboratingEmployees = [];
    }
}