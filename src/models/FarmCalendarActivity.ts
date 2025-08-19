export interface FarmCalendarActivityModel {
    '@id': string;
    '@type': string;
    activityType: {
        '@id': string;
        '@type': string;
    };
    details: string;
    hasEndDatetime: string;
    hasStartDatetime: string;
    responsibleAgent: any;
    title: string;
    usesAgriculturalMachinery: any[];
}