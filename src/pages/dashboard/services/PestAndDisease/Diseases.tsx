import GenericSortableTable from "@components/shared/GenericSortableTable/GenericSortableTable";
import { HeadCell } from "@components/shared/GenericSortableTable/GenericSortableTable.types";
import useFetch from "@hooks/useFetch";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Skeleton, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DiseasesResponseModel } from "@models/Disease";

import FileUploadIcon from '@mui/icons-material/FileUpload';
import PublishIcon from '@mui/icons-material/Publish';
import useSnackbar from "@hooks/useSnackbar";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";

const DiseasesPage = () => {
    const [diseases, setDiseases] = useState<DiseaseRow[]>([]);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [expanded, setExpanded] = useState<boolean>(false);

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    const { fetchData: getFetchData, response: getResponse, error: getError, loading: getLoading } = useFetch<DiseasesResponseModel>(
        `proxy/pdm/api/v1/pest-model/`,
        {
            method: 'GET',
        }
    );

    const { fetchData: uploadFetchData, response: uploadResponse, error: uploadError, loading: uploadLoading } = useFetch<any>(
        `proxy/pdm/api/v1/pest-model/upload-excel/`,
        {
            method: 'POST',
        }
    );

    useEffect(() => {
        getFetchData();
    }, []);

    useEffect(() => {
        if (getResponse) {
            const formattedDiseases = getResponse.pests.map((d) => {
                return {
                    id: d.id,
                    name: d.name,
                    description: d.description,
                    geoAreasOfApplication: d.geo_areas_of_application
                }
            })
            setDiseases(formattedDiseases);
        }
    }, [getResponse])

    useEffect(() => {
        if (uploadResponse) {
            getFetchData();
            showSnackbar('success', "Disease dataset added successfully!");
            setExpanded(false);
        }
    }, [uploadResponse])

    useEffect(() => {
        if (uploadError) {
            showSnackbar('error', uploadError?.message.toString() ?? 'Error uploading file');
        }
    }, [uploadError])

    interface DiseaseRow {
        id: string;
        name: string;
        description: string;
        geoAreasOfApplication: string;
    }

    const diseasesHeadCells: readonly HeadCell<DiseaseRow>[] = [
        { id: 'name', numeric: false, label: 'Name' },
        { id: 'description', numeric: false, label: 'Description' },
        { id: 'geoAreasOfApplication', numeric: false, label: 'GEO areas of application' },
    ];

    const handleAccordionChange = () => {
        setExpanded(!expanded);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            console.log(event.target.files[0]);

            setSelectedFile(event.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;
        const formData = new FormData();
        formData.append('excel_file', selectedFile);
        await uploadFetchData({ body: formData });
    }

    return (
        <>
            <Box display={'flex'} flexDirection={'column'} gap={2}>
                <Accordion expanded={expanded} onChange={handleAccordionChange}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography component="span">Add new disease</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ maxHeight: 480, overflowY: 'scroll' }}>
                        <Box display={"flex"} flexDirection={"column"} gap={2}>
                            <Typography variant="body1">
                                Upload an excel file containing a dataset
                            </Typography>
                            <Typography variant="body1">
                                The file needs to have <b>.xlsx</b> as its extension.
                            </Typography>
                            <Alert severity={selectedFile ? 'success' : 'info'}>
                                {
                                    selectedFile ?
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
                                            accept=".xlsx"
                                            hidden
                                            onChange={handleFileChange}
                                        />
                                    </Button></Box>
                                    <Box><Button
                                        onClick={handleSubmit}
                                        startIcon={<PublishIcon />}
                                        loading={getLoading || uploadLoading}
                                        loadingPosition="start"
                                        disabled={!selectedFile}
                                        variant="contained">
                                        Submit
                                    </Button></Box>
                                </Box>
                            </Box>
                        </Box>
                    </AccordionDetails>
                </Accordion>
                {getLoading && <Skeleton variant="rectangular" height={48} />}
                {
                    !getLoading && !getError &&
                    <GenericSortableTable data={diseases} headCells={diseasesHeadCells}></GenericSortableTable>
                }
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

export default DiseasesPage;