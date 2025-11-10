import {
    BaseActivityModel,
    AddRawMaterialOperationModel,
    CompostOperationModel,
    CompostTurningOperationModel,
    CropGrowthStageObservationModel,
    CropProtectionOperationModel,
    CropStressIndicatorObservationModel,
    DiseaseDetectionModel,
    FertilizationOperationModel,
    GenericActivityModel,
    GenericAlertModel,
    GenericObservationModel,
    IrrigationOperationModel,
    SprayingRecommendationModel,
    VigorEstimationModel,
    YieldPredictionModel
} from '@models/FarmCalendarActivities';

const getEmptyBaseActivity = (): BaseActivityModel => ({
    "@id": "",
    "@type": "",
    activityType: {
        "@id": "",
        "@type": ""
    },
    title: "",
    details: ""
});


const getEmptyAddRawMaterialOperation = (): AddRawMaterialOperationModel => ({
    ...getEmptyBaseActivity(),
    "@type": "AddRawMaterialOperation",
    hasStartDatetime: "",
    hasEndDatetime: "",
    operatedOn: {
        "@id": "",
        "@type": ""
    },
    isPartOfActivity: null,
    responsibleAgent: null,
    usesAgriculturalMachinery: [],
    hasCompostMaterial: []
});

const getEmptyCompostOperation = (): CompostOperationModel => ({
    ...getEmptyBaseActivity(),
    "@type": "CompostOperation",
    hasStartDatetime: "",
    hasEndDatetime: "",
    responsibleAgent: null,
    usesAgriculturalMachinery: [],
    hasAgriParcel: {
        "@id": "",
        "@type": ""
    },
    isPartOfActivity: null,
    isOperatedOn: {
        "@id": "",
        "@type": ""
    },
    hasNestedOperation: [],
    hasMeasurement: []
});

const getEmptyCompostTurningOperation = (): CompostTurningOperationModel => ({
    ...getEmptyBaseActivity(),
    "@type": "CompostTurningOperation",
    hasStartDatetime: "",
    hasEndDatetime: "",
    operatedOn: {
        "@id": "",
        "@type": ""
    },
    isPartOfActivity: null,
    responsibleAgent: null,
    usesAgriculturalMachinery: []
});

const getEmptyCropGrowthStageObservation = (): CropGrowthStageObservationModel => ({
    ...getEmptyBaseActivity(),
    "@type": "CropGrowthStageObservation",
    phenomenonTime: "",
    hasEndDatetime: "",
    madeBySensor: {
        "@id": "",
        "@type": "",
        name: ""
    },
    hasAgriParcel: {
        "@id": "",
        "@type": ""
    },
    isPartOfActivity: null,
    hasAgriCrop: {
        "@id": "",
        "@type": ""
    },
    hasResult: {
        "@id": "",
        "@type": "",
        unit: "",
        hasValue: ""
    },
    observedProperty: ""
});

const getEmptyCropProtectionOperation = (): CropProtectionOperationModel => ({
    ...getEmptyBaseActivity(),
    "@type": "CropProtectionOperation",
    hasStartDatetime: "",
    hasEndDatetime: "",
    responsibleAgent: null,
    usesAgriculturalMachinery: [],
    isPartOfActivity: null,
    hasAppliedAmount: {
        "@id": "",
        "@type": "",
        unit: "",
        numericValue: 0
    },
    usesPesticide: {
        "@id": "",
        "@type": ""
    },
    operatedOn: {
        "@id": "",
        "@type": ""
    }
});

const getEmptyCropStressIndicatorObservation = (): CropStressIndicatorObservationModel => ({
    ...getEmptyBaseActivity(),
    "@type": "CropStressIndicatorObservation",
    phenomenonTime: "",
    hasEndDatetime: "",
    madeBySensor: {
        "@id": "",
        "@type": "",
        name: ""
    },
    hasAgriParcel: {
        "@id": "",
        "@type": ""
    },
    isPartOfActivity: null,
    hasAgriCrop: {
        "@id": "",
        "@type": ""
    },
    hasResult: {
        "@id": "",
        "@type": "",
        unit: "",
        hasValue: ""
    },
    observedProperty: ""
});

const getEmptyDiseaseDetection = (): DiseaseDetectionModel => ({
    ...getEmptyBaseActivity(),
    "@type": "DiseaseDetection",
    phenomenonTime: "",
    hasEndDatetime: "",
    madeBySensor: {
        "@id": "",
        "@type": "",
        name: ""
    },
    hasAgriParcel: {
        "@id": "",
        "@type": ""
    },
    isPartOfActivity: null,
    hasArea: "",
    hasResult: {
        "@id": "",
        "@type": "",
        unit: "",
        hasValue: ""
    },
    observedProperty: ""
});

const getEmptyFertilizationOperation = (): FertilizationOperationModel => ({
    ...getEmptyBaseActivity(),
    "@type": "FertilizationOperation",
    hasStartDatetime: "",
    hasEndDatetime: "",
    responsibleAgent: null,
    usesAgriculturalMachinery: [],
    isPartOfActivity: null,
    hasAppliedAmount: {
        "@id": "",
        "@type": "",
        unit: "",
        numericValue: 0
    },
    hasApplicationMethod: "",
    usesFertilizer: {
        "@id": "",
        "@type": ""
    },
    operatedOn: {
        "@id": "",
        "@type": ""
    }
});

const getEmptyGenericActivity = (): GenericActivityModel => ({
    ...getEmptyBaseActivity(),
    "@type": "FarmCalendarActivity",
    hasStartDatetime: "",
    hasEndDatetime: "",
    hasAgriParcel: {
        "@id": "",
        "@type": ""
    },
    isPartOfActivity: null,
    responsibleAgent: null,
    usesAgriculturalMachinery: []
});

const getEmptyGenericAlert = (): GenericAlertModel => ({
    ...getEmptyBaseActivity(),
    "@type": "Alert",
    severity: "",
    hasAgriParcel: {
        "@id": "",
        "@type": ""
    },
    validFrom: "",
    validTo: "",
    dateIssued: "",
    quantityValue: {},
    relatedObservation: null
});

const getEmptyGenericObservation = (): GenericObservationModel => ({
    ...getEmptyBaseActivity(),
    "@type": "Observation",
    phenomenonTime: "",
    hasEndDatetime: "",
    hasAgriParcel: {
        "@id": "",
        "@type": ""
    },
    isPartOfActivity: null,
    madeBySensor: {
        "@id": "",
        "@type": "",
        name: ""
    },
    hasResult: {
        "@id": "",
        "@type": "",
        unit: "",
        hasValue: ""
    },
    observedProperty: ""
});

const getEmptyIrrigationOperation = (): IrrigationOperationModel => ({
    ...getEmptyBaseActivity(),
    "@type": "IrrigationOperation",
    hasStartDatetime: "",
    hasEndDatetime: "",
    responsibleAgent: null,
    usesAgriculturalMachinery: [],
    isPartOfActivity: null,
    hasAppliedAmount: {
        "@id": "",
        "@type": "",
        unit: "",
        numericValue: 0
    },
    usesIrrigationSystem: "",
    operatedOn: {
        "@id": "",
        "@type": ""
    }
});

const getEmptySprayingRecommendation = (): SprayingRecommendationModel => ({
    ...getEmptyBaseActivity(),
    "@type": "SprayingRecommendation",
    phenomenonTime: "",
    hasEndDatetime: "",
    madeBySensor: {
        "@id": "",
        "@type": "",
        name: ""
    },
    hasAgriParcel: {
        "@id": "",
        "@type": ""
    },
    isPartOfActivity: null,
    hasArea: "",
    hasResult: {
        "@id": "",
        "@type": "",
        unit: "",
        hasValue: ""
    },
    observedProperty: "",
    usesPesticide: {
        "@id": "",
        "@type": ""
    }
});

const getEmptyVigorEstimation = (): VigorEstimationModel => ({
    ...getEmptyBaseActivity(),
    "@type": "VigorEstimation",
    phenomenonTime: "",
    hasEndDatetime: "",
    madeBySensor: {
        "@id": "",
        "@type": "",
        name: ""
    },
    hasAgriParcel: {
        "@id": "",
        "@type": ""
    },
    isPartOfActivity: null,
    hasArea: "",
    hasResult: {
        "@id": "",
        "@type": "",
        unit: "",
        hasValue: ""
    },
    observedProperty: ""
});

const getEmptyYieldPrediction = (): YieldPredictionModel => ({
    ...getEmptyBaseActivity(),
    "@type": "YieldPrediction",
    phenomenonTime: "",
    hasEndDatetime: "",
    madeBySensor: {
        "@id": "",
        "@type": "",
        name: ""
    },
    hasAgriParcel: {
        "@id": "",
        "@type": ""
    },
    isPartOfActivity: null,
    hasArea: "",
    hasResult: {
        "@id": "",
        "@type": "",
        unit: "",
        hasValue: ""
    },
    observedProperty: ""
});


export const activityModelFactory: Record<string, () => BaseActivityModel> = {
    "/api/v1/YieldPrediction/": getEmptyYieldPrediction,
    "/api/v1/VigorEstimation/": getEmptyVigorEstimation,
    "/api/v1/Observations/": getEmptyGenericObservation,
    "/api/v1/SprayingRecommendation/": getEmptySprayingRecommendation,
    "/api/v1/CropProtectionOperations/": getEmptyCropProtectionOperation,
    "/api/v1/IrrigationOperations/": getEmptyIrrigationOperation,
    "/api/v1/FertilizationOperations/": getEmptyFertilizationOperation,
    "/api/v1/DiseaseDetection/": getEmptyDiseaseDetection,
    "/api/v1/Alerts/": getEmptyGenericAlert,
    "/api/v1/FarmCalendarActivities/": getEmptyGenericActivity,
    "/api/v1/CropStressIndicatorObservations/": getEmptyCropStressIndicatorObservation,
    "/api/v1/CropGrowthStageObservations/": getEmptyCropGrowthStageObservation,
    "/api/v1/CompostTurningOperations/": getEmptyCompostTurningOperation,
    "/api/v1/CompostOperations/": getEmptyCompostOperation,
    "/api/v1/AddRawMaterialOperations/": getEmptyAddRawMaterialOperation,
};