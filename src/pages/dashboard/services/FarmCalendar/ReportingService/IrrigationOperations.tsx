import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import ContentGuard from "@components/shared/ContentGuard/ContentGuard";
import GenericDialog from "@components/shared/GenericDialog/GenericDialog";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import StyledFullCalendar from "@components/shared/styled/StyledFullCalendar/StyledFullCalendar";
import { useSession } from "@contexts/SessionContext";
import { EventClickArg, EventInput } from "@fullcalendar/core/index.js";
import useDialog from "@hooks/useDialog";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { CompostOperationModel } from "@models/CompostOperation";
import { Box, Button, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import dayjs, { Dayjs } from "dayjs";

interface ReportHelper {
    reportType: string;
    compostOperationID?: string;
    fromDate?: string;
    toDate?: string;
}

const IrrigationOperationsPage = () => {

    const { session } = useSession();

    const [reportHelper, setReportHelper] = useState<ReportHelper>({ reportType: '', compostOperationID: '' });
    const [loadingReport, setLoadingReport] = useState<boolean>(false);
    const [reportUUID, setReportUUID] = useState<string>('');
    const [dateRange, setDateRange] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });

    const [fromDate, setFromDate] = useState<Dayjs | null>(null);
    const [toDate, setToDate] = useState<Dayjs | null>(null);

    const [activeEventInfo, setActiveEventInfo] = useState<EventClickArg | null>(null);

    const { fetchData: fetchDataCompostActivities, response: responseCompostActivities } = useFetch<CompostOperationModel[]>(
        `proxy/farmcalendar/api/v1/IrrigationOperations/?format=json&parcel=${session?.farm_parcel?.["@id"].split(':')[3]}`,
        {
            method: 'GET',
        }
    );

    const { fetchData: fetchDataGenerate, response: responseGenerate, error: errorGenerate } = useFetch<{ uuid: string }>(
        `proxy/reporting/api/v1/openagri-report/${reportHelper.reportType}/?`
        + `${reportHelper.compostOperationID ? 'operation_id=' + reportHelper.compostOperationID : ''}`
        + `${reportHelper.fromDate ? 'from_date=' + reportHelper.fromDate : ''}`
        + `${reportHelper.toDate ? '&to_date=' + reportHelper.toDate : ''}`,
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
            }, 2000);
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
    }, [session?.farm_parcel, dateRange])

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
        setFromDate(null)
        setToDate(null)
        setActiveEventInfo(null);
    };

    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            <ContentGuard condition={session?.farm_parcel}>
                <Box display={'flex'} flexDirection={'column'} gap={2}>
                    <StyledFullCalendar
                        events={calendarEvents}
                        eventClick={
                            (info) => {
                                setActiveEventInfo(info);
                                setFromDate(null)
                                setToDate(null)
                                showDialog({
                                    title: `Report actions for ${info.event.title}`,
                                    variant: 'empty',
                                    children: <></>
                                });
                            }
                        }
                        onDateRangeChange={setDateRange}
                        selectable={true}
                        select={
                            (info) => {
                                console.log(info);
                                setActiveEventInfo(null);
                                setFromDate(dayjs(info.start));
                                setToDate(dayjs(info.end));
                                showDialog({
                                    title: `Generate irrigation report for selected date range`,
                                    variant: 'empty',
                                    children: <></>
                                });
                            }
                        }
                    />
                </Box>
            </ContentGuard >

            <GenericDialog {...dialogProps} onClose={handleCloseDialog}>
                <>
                    <Box display={'flex'} flexDirection={'column'} gap={2}>
                        {fromDate && toDate &&
                            <Typography variant="body1">{fromDate.format('dddd, D/MMM/YYYY')} - {toDate.format('dddd, D/MMM/YYYY')}</Typography>
                        }
                        <Button
                            variant="contained"
                            startIcon={<InsertDriveFileIcon />}
                            onClick={
                                () => handleGenerateReport(
                                    {
                                        reportType: 'irrigation-report',
                                        compostOperationID: activeEventInfo?.event.id.split(':')[3],
                                        fromDate: fromDate?.format('YYYY-MM-DD'),
                                        toDate: toDate?.format('YYYY-MM-DD')
                                    })
                            }
                            loading={loadingReport}
                        >
                            Generate report
                        </Button>
                    </Box>
                </>
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

export default IrrigationOperationsPage;