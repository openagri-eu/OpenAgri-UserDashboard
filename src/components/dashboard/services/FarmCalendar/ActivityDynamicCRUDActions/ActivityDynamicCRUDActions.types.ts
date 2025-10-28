import { BaseActivityModel } from "@models/FarmCalendarActivities";

export interface ActivityDynamicCRUDActionsProps<T extends BaseActivityModel> {
    activity: T;
    onSave?: (activityToSave: BaseActivityModel) => void;
    onAdd?: (activityToSave: BaseActivityModel) => void;
    onDelete?: () => void;
    loading: boolean;
}