import GenericSelect from "@components/shared/GenericSelect/GenericSelect";
import { FarmCalendarActivityTypeModel } from "@models/FarmCalendarActivityType";
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
import { Box, Typography } from "@mui/material";
import { activityModelFactory } from "@utils/activityModelFactory";
import { useEffect, useState } from "react";
import ActivityDynamicCRUDActions from "@components/dashboard/services/FarmCalendar/ActivityDynamicCRUDActions/ActivityDynamicCRUDActions";
import { useLocation } from "react-router-dom";

const ActivityFormComponentMap: { [key: string]: React.FC<any> } = {
    'AddRawMaterialOperation': (props) => <ActivityDynamicCRUDActions<AddRawMaterialOperationModel> {...props} />,
    'CompostOperation': (props) => <ActivityDynamicCRUDActions<CompostOperationModel> {...props} />,
    'CompostTurningOperation': (props) => <ActivityDynamicCRUDActions<CompostTurningOperationModel> {...props} />,
    'CropGrowthStageObservation': (props) => <ActivityDynamicCRUDActions<CropGrowthStageObservationModel> {...props} />,
    'CropProtectionOperation': (props) => <ActivityDynamicCRUDActions<CropProtectionOperationModel> {...props} />,
    'CropStressIndicatorObservation': (props) => <ActivityDynamicCRUDActions<CropStressIndicatorObservationModel> {...props} />,
    'DiseaseDetection': (props) => <ActivityDynamicCRUDActions<DiseaseDetectionModel> {...props} />,
    'FertilizationOperation': (props) => <ActivityDynamicCRUDActions<FertilizationOperationModel> {...props} />,
    'FarmCalendarActivity': (props) => <ActivityDynamicCRUDActions<GenericActivityModel> {...props} />,
    'Alert': (props) => <ActivityDynamicCRUDActions<GenericAlertModel> {...props} />,
    'Observation': (props) => <ActivityDynamicCRUDActions<GenericObservationModel> {...props} />,
    'IrrigationOperation': (props) => <ActivityDynamicCRUDActions<IrrigationOperationModel> {...props} />,
    'SprayingRecommendation': (props) => <ActivityDynamicCRUDActions<SprayingRecommendationModel> {...props} />,
    'VigorEstimation': (props) => <ActivityDynamicCRUDActions<VigorEstimationModel> {...props} />,
    'YieldPrediction': (props) => <ActivityDynamicCRUDActions<YieldPredictionModel> {...props} />,
};
interface LocationState {
    activityTypes: FarmCalendarActivityTypeModel[] | undefined;
}

const RegisterCalendarActivityPage = () => {
    const location = useLocation();

    const state = location.state as LocationState;
    const activityTypes = state?.activityTypes;

    const [selectedActivityType, setSelectedActivityType] = useState<string>('');

    const [activityData, setActivityData] = useState<BaseActivityModel | null>(null);

    useEffect(() => {
        if (selectedActivityType) {
            const getEmptyModel = activityModelFactory[selectedActivityType];

            if (getEmptyModel) {
                setActivityData(getEmptyModel());
            } else {
                console.warn(`No empty model factory found for endpoint: ${selectedActivityType}`);
                setActivityData(null);
            }
        } else {
            setActivityData(null);
        }
    }, [selectedActivityType]);

    const handlePost = (activityToSave: BaseActivityModel) => {
        console.log({ body: activityToSave });
    };

    const renderForm = () => {
        if (!activityData) return null;

        const activityType = activityData['@type'];
        const FormComponent = ActivityFormComponentMap[activityType];

        if (!FormComponent) {
            return <Typography color="error">Unknown activity type: {activityType}</Typography>;
        }

        return (
            <FormComponent
                activity={activityData}
                activityTypes={activityTypes}
                onAdd={handlePost}
            // loading={loading}
            />
        );
    };

    return (
        <>
            <Box display={'flex'} flexDirection={'column'} gap={2}>
                <Typography variant={'h4'} >Register new activity</Typography>

                <GenericSelect<FarmCalendarActivityTypeModel>
                    endpoint=''
                    data={activityTypes}
                    label='Activity type'
                    selectedValue={selectedActivityType}
                    setSelectedValue={setSelectedActivityType}
                    getOptionLabel={item => `${item.name}`}
                    getOptionValue={item => item.activity_endpoint}
                />

                {activityData && renderForm()}
            </Box>
        </>
    )
}

export default RegisterCalendarActivityPage;