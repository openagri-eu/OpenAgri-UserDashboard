import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import StyledFullCalendar from "@components/shared/styled/StyledFullCalendar/StyledFullCalendar";
import { EventInput } from "@fullcalendar/core/index.js";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { CompostOperationModel } from "@models/CompostOperation";
import { useEffect, useMemo, useState } from "react";

interface ReportHelper {
    reportType: string;
    compostOperationID: string;
}

const ReportingService = () => {

    const [reportHelper, setReportHelper] = useState<ReportHelper>({ reportType: '', compostOperationID: '' });
    const [loadingReport, setLoadingReport] = useState<boolean>(false);
    const [reportUUID, setReportUUID] = useState<string>('');
    const [_, setDateRange] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });


    const { fetchData: fetchDataCompostActivities, response: responseCompostActivities } = useFetch<CompostOperationModel[]>(
        `proxy/farmcalendar/api/v1/CompostOperations/?format=json`,
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
        fetchDataCompostActivities();
    }, [])

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

    return (
        <>
            <StyledFullCalendar
                events={calendarEvents}
                eventClick={
                    (info) => {
                        handleGenerateReport({ reportType: 'compost-report', compostOperationID: info.event.id.split(':')[3] })
                    }
                }
                onDateRangeChange={setDateRange}
                loading={loadingReport}
            />
            <GenericSnackbar
                type={snackbarState.type}
                message={snackbarState.message}
                open={snackbarState.open}
                onClose={closeSnackbar}
            />
        </>
    )
}

export default ReportingService;