import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import ContentGuard from "@components/shared/ContentGuard/ContentGuard";
import GenericDialog from "@components/shared/GenericDialog/GenericDialog";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import StyledFullCalendar from "@components/shared/styled/StyledFullCalendar/StyledFullCalendar";
import { useSession } from "@contexts/SessionContext";
import { EventClickArg, EventInput } from "@fullcalendar/core/index.js"; // Import EventClickArg for better typing
import useDialog from "@hooks/useDialog";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { CompostOperationModel } from "@models/CompostOperation";
import { Button } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

interface ReportHelper {
    reportType: string;
    compostOperationID: string;
}

const ReportingServicePage = () => {

    const { session } = useSession();

    const [reportHelper, setReportHelper] = useState<ReportHelper>({ reportType: '', compostOperationID: '' });
    const [loadingReport, setLoadingReport] = useState<boolean>(false);
    const [reportUUID, setReportUUID] = useState<string>('');
    const [_, setDateRange] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });

    const [activeEventInfo, setActiveEventInfo] = useState<EventClickArg | null>(null);

    const { fetchData: fetchDataCompostActivities, response: responseCompostActivities } = useFetch<CompostOperationModel[]>(
        `proxy/farmcalendar/api/v1/CompostOperations/?format=json&parcel=${session?.farm_parcel?.["@id"].split(':')[3]}`,
        {
            method: 'GET',
        }
    );

    const { fetchData: fetchDataGenerate, response: responseGenerate, error: errorGenerate } = useFetch<{ uuid: string }>(
        `proxy/reporting/api/v1/openagri-report/${reportHelper.reportType}/?operation_id=${reportHelper.compostOperationID}`,
        {
            method: 'POST',
        }
    );

    const { fetchData: fetchDataReport, response: responseReport, error: errorReport } = useFetch<any[]>(
        `proxy/reporting/api/v1/openagri-report/${reportUUID}/`,
        {
            method: 'GET',
            responseType: 'blob'
        }
    );

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    const { dialogProps, showDialog } = useDialog();

    /** Calls */
    useEffect(() => {
        if (reportHelper.reportType) {
            fetchDataGenerate();
        }
    }, [reportHelper])

    useEffect(() => {
        if (reportUUID) {
            setLoadingReport(true);
            setTimeout(() => {
                fetchDataReport();
            }, 1500);
        }
    }, [reportUUID])

    /** Reacting to the responses */
    useEffect(() => {
        if (responseGenerate) {
            setReportUUID(responseGenerate.uuid);
        }
    }, [responseGenerate])

    useEffect(() => {
        if (responseReport instanceof Blob) {
            setLoadingReport(false);

            const url = URL.createObjectURL(responseReport);

            const a = document.createElement('a');
            a.href = url;
            a.download = `report-${reportUUID}.pdf`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(url);
        }
    }, [responseReport])


    /** Reacting to the errors */
    useEffect(() => {
        if (errorGenerate || errorReport) {
            setLoadingReport(false);
            showSnackbar('error', 'Error generating report');
        }
    }, [errorGenerate, errorReport])

    useEffect(() => {
        if (session?.farm_parcel) {
            fetchDataCompostActivities();
        }
    }, [session?.farm_parcel])

    const calendarEvents = useMemo(() => {
        if (!Array.isArray(responseCompostActivities)) {
            return [];
        }
        return responseCompostActivities.map((event): EventInput => ({
            id: event['@id'],
            title: event.title,
            start: event.hasStartDatetime,
            end: event.hasEndDatetime,
            extendedProps: {
                details: event.details,
                activityType: event.activityType,
            }
        }));
    }, [responseCompostActivities]);

    const handleGenerateReport = (reportHelper: ReportHelper) => {
        setReportHelper(reportHelper);
    };

    const handleCloseDialog = () => {
        dialogProps.onClose();
        setActiveEventInfo(null);
    };

    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            <ContentGuard condition={session?.farm_parcel}>
                <StyledFullCalendar
                    events={calendarEvents}
                    eventClick={
                        (info) => {
                            setActiveEventInfo(info);
                            showDialog({
                                title: `Report actions for ${info.event.title}`,
                                variant: 'empty',
                                children: <></>
                            });
                        }
                    }
                    onDateRangeChange={setDateRange}
                />
            </ContentGuard>

            <GenericDialog {...dialogProps} onClose={handleCloseDialog}>
                {activeEventInfo && (
                    <Button
                        variant="contained"
                        startIcon={<InsertDriveFileIcon />}
                        loadingPosition="start"
                        onClick={
                            () => handleGenerateReport({ reportType: 'compost-report', compostOperationID: activeEventInfo.event.id.split(':')[3] })
                        }
                        loading={loadingReport}
                    >
                        Generate report
                    </Button>
                )}
            </GenericDialog>
            <GenericSnackbar
                type={snackbarState.type}
                message={snackbarState.message}
                open={snackbarState.open}
                onClose={closeSnackbar}
            />
        </>
    )
}

export default ReportingServicePage;