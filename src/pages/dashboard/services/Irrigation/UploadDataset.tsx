import { Alert, Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import FileUploadIcon from '@mui/icons-material/FileUpload';
import PublishIcon from '@mui/icons-material/Publish';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import useFetch from "@hooks/useFetch";
import { DatasetRow } from "@models/SoilMoisture";
import useSnackbar from "@hooks/useSnackbar";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";

const UploadDatasetPage = () => {
    const [jsonData, setJsonData] = useState<DatasetRow[]>([]);

    const { fetchData, loading, response, error } = useFetch<any>(
        "proxy/irrigation/api/v1/dataset/",
        {
            method: 'POST',
            body: jsonData
        }
    );

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    useEffect(() => {
        if (response) {
            showSnackbar('success', "Soil moisture dataset added successfully!");
        }
    }, [response])

    useEffect(() => {
        if (error) {
            showSnackbar('error', error?.message.toString() ?? '');
        }
    }, [error])


    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const datasetId = file.name.split(".")[0]; // Extract file name without extension

            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const dataRows = text.split("\n").slice(1).filter((row) => row.trim() !== "");

                const parsedData = dataRows.map((row) => {
                    const values = row.split(",").map((value) => value.trim());
                    return {
                        dataset_id: datasetId,
                        date: values[0],
                        soil_moisture_10: +values[1] || 0,
                        soil_moisture_20: +values[2] || 0,
                        soil_moisture_30: +values[3] || 0,
                        soil_moisture_40: +values[4] || 0,
                        soil_moisture_50: +values[5] || 0,
                        soil_moisture_60: +values[6] || 0,
                        rain: +values[7] || 0,
                        temperature: +values[8] || 0,
                        humidity: +values[9] || 0,
                    } as DatasetRow;
                });

                setJsonData(parsedData);
            };

            reader.readAsText(file);
            event.target.value = '';
        }
    };


    const handleSubmit = async () => {
        await fetchData()
    }

    return (
        <>
            <Box display={'flex'} flexDirection={'column'} gap={3}>
                <Card variant="outlined">
                    <CardContent>
                        <Box display={"flex"} flexDirection={"column"} gap={2}>
                            <Typography variant="body1">
                                Upload an excel file containing a dataset
                            </Typography>
                            <Typography variant="body1">
                                The file needs to have <b>.csv</b> as its extension.
                            </Typography>
                            <Alert severity={jsonData.length ? 'success' : 'info'}>
                                {
                                    jsonData.length ?
                                        <Typography variant="body1">
                                            File uploaded, please submit.
                                        </Typography> :
                                        <Typography variant="body1">
                                            Please upload a file to the platform.
                                        </Typography>
                                }
                            </Alert>
                            <Box display={"flex"} flexDirection={{ xs: "column", md: "row" }} gap={{ xs: 1, md: 0 }} justifyContent={"space-between"}>
                                <Box display={"flex"} flexDirection={{ xs: "column", md: "row" }} gap={1}>
                                    <Box><Button
                                        component="label"
                                        role={undefined}
                                        variant="contained"
                                        tabIndex={-1}
                                        startIcon={<FileUploadIcon />}
                                    >
                                        Upload file
                                        <input
                                            type="file"
                                            accept=".csv"
                                            hidden
                                            onChange={handleFileUpload}
                                        />
                                    </Button></Box>
                                    <Box><Button
                                        onClick={handleSubmit}
                                        startIcon={<PublishIcon />}
                                        loading={loading}
                                        loadingPosition="start"
                                        disabled={!jsonData.length}
                                        variant="contained">
                                        Submit
                                    </Button></Box>
                                </Box>
                                <Box>
                                    <Button
                                        component="a"
                                        href="/examples/irrigation/example.csv"
                                        download
                                        variant="contained"
                                        color="primary"
                                        startIcon={<FileDownloadIcon />}
                                    >
                                        Download example file
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
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

export default UploadDatasetPage;