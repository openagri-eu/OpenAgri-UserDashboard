export interface CompostOperationModel {
    '@id': string;
    '@type': string;
    activityType: {
        '@id': string;
        '@type': string;
    };
    title: string;
    details: string;
    hasStartDatetime: string;
    hasEndDatetime: string;
    responsibleAgent: string;
    usesAgriculturalMachinery: any[];
    isOperatedOn: {
        '@id': string;
        '@type': string;
    };
    hasNestedOperation: any[];
    hasMeasurement: any[];
}