export interface IrrigationOperationModel {
    '@id': string;
    '@type': 'IrrigationOperation';
    activityType: {
        '@id': string;
        '@type': string;
    };
    title: string;
    details: string;
    hasStartDatetime: string;
    hasEndDatetime: string;
    responsibleAgent: string | null;
    usesAgriculturalMachinery: any[];
    hasAppliedAmount: {
        '@id': string;
        '@type': 'QuantityValue';
        unit: string;
        numericValue: number;
    };
    usesIrrigationSystem: string;
    operatedOn: {
        '@id': string;
        '@type': string;
    };
}