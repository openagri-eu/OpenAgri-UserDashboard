import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";

const ReportingService = () => {

    const [reportType, setReportType] = useState<{ reportType: string }>({ reportType: '' });
    const [reportUUID, setReportUUID] = useState<string>('');

    const { fetchData: fetchDataGenerate, response: responseGenerate, error: errorGenerate } = useFetch<{ uuid: string }>(
        `proxy/reporting/api/v1/openagri-report/${reportType.reportType}/`,
        {
            method: 'POST',
        }
    );

    const { fetchData: fetchDataReport, response: responseReport, error: errorReport } = useFetch<any[]>(
        `proxy/reporting/api/v1/openagri-report/${reportUUID}`,
        {
            method: 'GET',
        }
    );

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    /** Calls */
    useEffect(() => {
        if (reportType.reportType) {
            fetchDataGenerate();
        }
    }, [reportType])

    useEffect(() => {
        if (reportUUID) {
            fetchDataReport();
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
            console.log(responseReport);
        }
    }, [responseReport])


    /** Reacting to the errors */
    useEffect(() => {
        if (errorGenerate || errorReport) {
            showSnackbar('error', 'Error generating report');
        }
    }, [errorGenerate, errorReport])

    const handleGenerateReport = (reportType: { reportType: string }) => {
        setReportType(reportType);
    };

    return (
        <>
            <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                <Box><Button onClick={() => handleGenerateReport({ reportType: 'irrigation-report' })} variant="contained">Generate irrigation report</Button></Box>
                <Box><Button onClick={() => handleGenerateReport({ reportType: 'compost-report' })} variant="contained">Generate generic observation report</Button></Box>
                <Box><Button onClick={() => handleGenerateReport({ reportType: 'animal-report' })} variant="contained">Generate animal report</Button></Box>
            </Box>
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