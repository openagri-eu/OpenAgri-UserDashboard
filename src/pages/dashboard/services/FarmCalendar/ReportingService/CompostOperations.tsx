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
import DateRangeSelect from "@components/shared/DateRangeSelect/DateRangeSelect";
import dayjs, { Dayjs } from "dayjs";

interface ReportHelper {
    reportType: string;
    compostOperationID: string;
    fromDate?: string;
    toDate?: string;
}

const CompostOperationsReportPage = () => {

    const { session } = useSession();

    const [reportHelper, setReportHelper] = useState<ReportHelper>({ reportType: '', compostOperationID: '' });
    const [loadingReport, setLoadingReport] = useState<boolean>(false);
    const [reportUUID, setReportUUID] = useState<string>('');
    const [dateRange, setDateRange] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });

    const [tries, setTries] = useState<number>(0);

    const [fromDate, setFromDate] = useState<Dayjs | null>(null);
    const [toDate, setToDate] = useState<Dayjs | null>(null);

    const [activeEventInfo, setActiveEventInfo] = useState<EventClickArg | null>(null);

    const { fetchData: fetchDataCompostActivities, response: responseCompostActivities } = useFetch<CompostOperationModel[]>(
        `proxy/farmcalendar/api/v1/CompostOperations/?format=json&parcel=${session?.farm_parcel?.["@id"].split(':')[3]}`,
        {
            method: 'GET',
        }
    );

    const { fetchData: fetchDataGenerate, response: responseGenerate, error: errorGenerate } = useFetch<{ uuid: string }>(
        `proxy/reporting/api/v1/openagri-report/${reportHelper.reportType}/?parcel_id=${session?.farm_parcel?.["@id"].split(':')[3]}`
        + `&operation_id=${reportHelper.compostOperationID}`
        + `${reportHelper.fromDate ? '&from_date=' + reportHelper.fromDate : ''}`
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
            }, 1000);
        }
    }, [reportUUID])

    /** Reacting to the responses */
    useEffect(() => {
        if (responseGenerate) {
            setReportUUID(responseGenerate.uuid);
        }
    }, [responseGenerate])

    useEffect(() => {
        if (responseReport) {
            if (responseReport instanceof Blob) {
                setLoadingReport(false);
                setTries(0);

                const url = URL.createObjectURL(responseReport);

                const a = document.createElement('a');
                a.href = url;
                a.download = `report-${reportUUID}.pdf`;

                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                URL.revokeObjectURL(url);
            } else {
                setTries(tries + 1);
                if (tries > 3) {
                    setLoadingReport(false);
                    setTries(0);
                    showSnackbar('error', 'Error generating report');
                } else {
                    setTimeout(() => {
                        fetchDataReport();
                    }, 5000);
                }
            }
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
                                setFromDate(dayjs(info.event.start))
                                setToDate(dayjs(info.event.end))
                                showDialog({
                                    title: `Report actions for ${info.event.title}`,
                                    variant: 'empty',
                                    children: <></>
                                });
                            }
                        }
                        onDateRangeChange={setDateRange}
                    />
                </Box>
            </ContentGuard >

            <GenericDialog {...dialogProps} onClose={handleCloseDialog}>
                {activeEventInfo && (
                    <>
                        <Box display={'flex'} flexDirection={'column'} gap={2}>
                            <Typography variant="body1">
                                Freely fine tune date range
                            </Typography>
                            <DateRangeSelect
                                fromDate={fromDate}
                                setFromDate={setFromDate}
                                toDate={toDate}
                                setToDate={setToDate}>
                            </DateRangeSelect>
                            <Button
                                variant="contained"
                                startIcon={<InsertDriveFileIcon />}
                                onClick={
                                    () => handleGenerateReport(
                                        {
                                            reportType: 'compost-report',
                                            compostOperationID: activeEventInfo.event.id.split(':')[3],
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

export default CompostOperationsReportPage;