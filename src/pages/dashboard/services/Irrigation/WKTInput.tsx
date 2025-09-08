import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import useFetch from "@hooks/useFetch";
import { Alert, Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import { useEffect } from "react";

import FileUploadIcon from '@mui/icons-material/FileUpload';
import PublishIcon from '@mui/icons-material/Publish';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import useSnackbar from "@hooks/useSnackbar";
import useWKTPolygonValidator from "@hooks/useWKTPolygonValidator";

const WKTInputPage = () => {

    /** File upload */
    const {
        severity: fileSeverity,
        polygonErrorMessage: filePolygonErrorMessage,
        wktContent: fileWktContent,
        handleWKTInput: fileHandleWKTInput
    } = useWKTPolygonValidator();

    const { fetchData: fileFetchData, loading: fileLoading, response: fileResponse, error: fileError } = useFetch<any>(
        "proxy/irrigation/api/v1/location/parcel-wkt/",
        {
            method: 'POST',
            body: {
                'coordinates': fileWktContent
            }
        }
    );

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            fileHandleWKTInput(content);
        };

        reader.readAsText(file);
        event.target.value = ''; // Reset input value for re-upload
    };

    const fileHandleSubmit = async () => {
        await fileFetchData();
    }

    useEffect(() => {
        if (fileResponse) {
            showSnackbar('success', "WKT Polygon added successfully!");
        }
    }, [fileResponse])

    useEffect(() => {
        if (fileError) {
            showSnackbar('error', fileError?.message.toString() ?? '');
        }
    }, [fileError])
    /** End of file upload */



    /** Text input */
    const { polygonErrorMessage: textPolygonErrorMessage, wktContent: textWktContent, handleWKTInput: textHandleWKTInput } = useWKTPolygonValidator();

    const { fetchData: textFetchData, loading: textLoading, response: textResponse, error: textError } = useFetch<any>(
        "proxy/irrigation/api/v1/location/parcel-wkt/",
        {
            method: 'POST',
            body: {
                'coordinates': textWktContent
            }
        }
    );

    const textHandleSubmit = async () => {
        await textFetchData();
    }

    useEffect(() => {
        if (textResponse) {
            showSnackbar('success', "WKT Polygon added successfully!");
        }
    }, [textResponse])

    useEffect(() => {
        if (textError) {
            showSnackbar('error', "Error while adding polygon");
        }
    }, [textError])
    /** End of text input */


    const WKTInfoText = `
        A WKT polygon file contains text-based representations of geometric shapes. ` +
        `The coordinates are enclosed in double parentheses, with the first and last points being the same to close the shape. 
        
        Example: POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))`;


    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            <Box display={'flex'} flexDirection={'column'} gap={3}>
                <Card variant="outlined">
                    <CardContent>
                        <Box display={"flex"} flexDirection={"column"} gap={2}>
                            <Typography variant="h6">
                                File upload
                            </Typography>
                            <Typography variant="body1">
                                Upload a file which contains a well-known text representation of a polygon.
                            </Typography>
                            <Typography variant="body1">
                                Accepted file extensions are <b>.wkt</b> and <b>.txt</b>
                            </Typography>
                            <Alert severity={fileSeverity}>
                                {fileSeverity === 'info' && <div>Upload a file containing a WKT (well-known text) representation of a polygon.</div>}
                                {fileSeverity === 'error' && <div>{filePolygonErrorMessage}</div>}
                                {fileSeverity === 'success' && <div>Uploaded file is correctly formatted.</div>}
                                <div className="whitespace-pre-line">{WKTInfoText}</div>
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
                                            accept=".txt,.wkt"
                                            hidden
                                            onChange={handleFileUpload}
                                        />
                                    </Button></Box>
                                    <Box><Button
                                        startIcon={<PublishIcon />}
                                        loading={fileLoading}
                                        loadingPosition="start"
                                        onClick={fileHandleSubmit}
                                        disabled={!fileWktContent}
                                        variant="contained">
                                        Submit
                                    </Button></Box>
                                </Box>
                                <Box>
                                    <Button
                                        component="a"
                                        href="/examples/irrigation/example.wkt"
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
                <Card variant="outlined">
                    <CardContent>
                        <Box display={"flex"} flexDirection={"column"} gap={2}>
                            <Typography variant="h6">
                                Text input
                            </Typography>
                            <Typography variant="body1">
                                Input a well-known text representation of a polygon in plain text format.
                            </Typography>
                            <Alert severity='info'>
                                <div className="whitespace-pre-line">{WKTInfoText}</div>
                            </Alert>
                            <Box display={"flex"} flexDirection={'column'} gap={1}>
                                <Box>
                                    <TextField
                                        error={!!textPolygonErrorMessage}
                                        id="standard-error-helper-text"
                                        onChange={(e) => textHandleWKTInput(e.target.value)}
                                        label="WKT Polygon"
                                        helperText={textPolygonErrorMessage}
                                        variant="filled"
                                        multiline
                                        maxRows={4}
                                        fullWidth
                                    />
                                </Box>
                                <Box><Button
                                    startIcon={<PublishIcon />}
                                    loading={textLoading}
                                    loadingPosition="start"
                                    onClick={textHandleSubmit}
                                    disabled={!textWktContent}
                                    variant="contained">
                                    Submit
                                </Button></Box>
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

export default WKTInputPage;