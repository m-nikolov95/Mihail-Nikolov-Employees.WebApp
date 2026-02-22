import React, { JSX, useState } from 'react';

import Papa from 'papaparse';

import { parseDate } from './utilities/date-parser-utilities';

import { Employee } from './models/employee-model';
import { EmployeeProjectOverlapModel } from './models/employee-project-overlap-model';
import { EmployeesByKeyModel } from './models/employee-by-key-model';
import { TeamWithMostWorkingDaysModel } from './models/team-with-most-working-days-model';
import { TeamKeyModel } from './models/team-key-model';

import { EmployeesState } from './state/employees-state';

import './App.css';

export function App(): JSX.Element {
    let [employeesState, setEmployeesState] = useState<EmployeesState>();

    const uploadFileAndSetData = (event: React.ChangeEvent<HTMLInputElement>): void => {
        let file = event.target.files?.[0];

        if (file !== null && file !== undefined) {
            Papa.parse(file, {
                header: true,
                complete: (results: Papa.ParseResult<Employee>) => {
                    setAndGroupEmployeesByProject(results.data);
                }
            });
        }
    }

    const setAndGroupEmployeesByProject = (employees: Employee[]): void => {
        let accumulatedEmployeesByProject = groupEmployeesByProject(employees);

        let collaboratingEmployees = getEmployeesWhoWorkedTogether(accumulatedEmployeesByProject)
            .map(employeeTeam => employeeTeam.team)
            .flat();

        setEmployeesState({ collaboratingEmployees });
    }

    const groupEmployeesByProject = (employees: Employee[]): EmployeesByKeyModel => {
        return employees
            .reduce((groupedBy: EmployeesByKeyModel, employee: Employee) => {
                groupedBy[employee.ProjectId] = groupedBy[employee.ProjectId] || [];

                groupedBy[employee.ProjectId].push(employee);

                return groupedBy;
            }, {});
    }

    const getEmployeesWhoWorkedTogether = (employeesByProject: EmployeesByKeyModel): TeamWithMostWorkingDaysModel[] => {
        let employeesWhoWorkedTogether: EmployeeProjectOverlapModel[] = [];

        Object.keys(employeesByProject).forEach((projectId: string) => {
            let employees = employeesByProject[projectId];

            for (let i = 0; i < employees.length; i++) {
                for (let j = i + 1; j < employees.length; j++) {

                    let daysWorkedTogether = calculateOnProjectDaysWorkedTogether(employees[i], employees[j]);

                    if (daysWorkedTogether > 0) {
                        employeesWhoWorkedTogether.push({
                            projectId: projectId,
                            firstEmployee: employees[i],
                            secondEmployee: employees[j],
                            daysWorkedOnProjectTogether: daysWorkedTogether
                        });
                    }
                }
            }
        }
        )

        return getTeamMostTogether(employeesWhoWorkedTogether);
    }

    const calculateOnProjectDaysWorkedTogether = (employeeOne: Employee, employeeTwo: Employee): number => {
        const millisecondsInSecond = 1000;
        const secondsInHour = 3600;
        const hoursInDay = 24;

        let employeeOneStartDate = parseDate(employeeOne.DateFrom);
        let employeeOneEndDate = employeeOne.DateTo ? parseDate(employeeOne.DateTo) : new Date();

        let employeeTwoStartDate = parseDate(employeeTwo.DateFrom);
        let employeeTwoEndDate = employeeTwo.DateTo ? parseDate(employeeTwo.DateTo) : new Date();

        let latestStart = Math.max(employeeOneStartDate.getTime(), employeeTwoStartDate.getTime());
        let earliestEnd = Math.min(employeeOneEndDate.getTime(), employeeTwoEndDate.getTime());

        let daysWorkedTogether = 0;
        if (latestStart <= earliestEnd) {
            let overlapTime = earliestEnd - latestStart;

            daysWorkedTogether = Math.ceil(overlapTime / (millisecondsInSecond * secondsInHour * hoursInDay)) + 1;
        }

        return daysWorkedTogether;
    }

    const getTeamMostTogether = (employeesWhoWorkedTogether: EmployeeProjectOverlapModel[]): TeamWithMostWorkingDaysModel[] => {
        let groupedEmployeePairs = employeesWhoWorkedTogether
            .reduce((groupedBy: TeamKeyModel, current: EmployeeProjectOverlapModel) => {
                let pairKey = `${current.firstEmployee.EmployeeId}-${current.secondEmployee.EmployeeId}`;

                groupedBy[pairKey] = groupedBy[pairKey] || [];

                groupedBy[pairKey].push(current);

                return groupedBy;
            }, {});


        let employeeTeamWithMostDays: TeamWithMostWorkingDaysModel[] = [];

        for (let thisEmployeePair in groupedEmployeePairs) {

            employeeTeamWithMostDays.push({
                team: groupedEmployeePairs[thisEmployeePair],
                totalDaysWorkedTogether: groupedEmployeePairs[thisEmployeePair]
                    .reduce((totalDays: number, current: EmployeeProjectOverlapModel) => totalDays + current.daysWorkedOnProjectTogether, 0)
            });
        }

        let maxDaysFromTeam = Math.max(...employeeTeamWithMostDays.map(employeeTeam => employeeTeam.totalDaysWorkedTogether));

        return employeeTeamWithMostDays.filter(employeeTeam => employeeTeam.totalDaysWorkedTogether === maxDaysFromTeam);
    }

    return (
        <div className='container'>
            <h1>Welcome to the Employees Project Collaboration System</h1>
            <input type='file'
                accept='.csv'
                onChange={uploadFileAndSetData} />

            {
                employeesState?.collaboratingEmployees !== null &&
                    employeesState?.collaboratingEmployees !== undefined &&
                    employeesState.collaboratingEmployees.length > 0 ?
                    <div className='tableContainer'>
                        <table>
                            <thead>
                                <tr>
                                    <th className='paddingText'>Employee ID #1</th>
                                    <th className='paddingText'>Employee ID #2</th>
                                    <th className='paddingText'>Project ID</th>
                                    <th className='paddingText'>Days worked</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    employeesState.collaboratingEmployees.map((team, index) => (
                                        <tr key={index}>
                                            <td className='paddingText'>{team.firstEmployee.EmployeeId}</td>
                                            <td className='paddingText'>{team.secondEmployee.EmployeeId}</td>
                                            <td className='paddingText'>{team.projectId}</td>
                                            <td className='paddingText'>{team.daysWorkedOnProjectTogether}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div> :
                    <></>
            }
        </div>
    );
}

export default App;