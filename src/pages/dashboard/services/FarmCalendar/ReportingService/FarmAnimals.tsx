import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import ContentGuard from "@components/shared/ContentGuard/ContentGuard";
import GenericDialog from "@components/shared/GenericDialog/GenericDialog";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import { useSession } from "@contexts/SessionContext";
import useDialog from "@hooks/useDialog";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { Dayjs } from "dayjs";
import { HeadCell } from "@components/shared/GenericSortableTable/GenericSortableTable.types";
import { FarmAnimalModel } from "@models/FarmAnimalModel";
import GenericSortableTable from "@components/shared/GenericSortableTable/GenericSortableTable";
import DateRangeSelect from "@components/shared/DateRangeSelect/DateRangeSelect";

interface ReportHelper {
    reportType: string;
    animalID?: string;
    fromDate?: string;
    toDate?: string;
}

const FarmAnimalsReportPage = () => {

    const [animals, setAnimals] = useState<AnimalRow[]>([]);

    const { session } = useSession();

    const [reportHelper, setReportHelper] = useState<ReportHelper>({ reportType: '', animalID: '' });
    const [loadingReport, setLoadingReport] = useState<boolean>(false);
    const [reportUUID, setReportUUID] = useState<string>('');

    const [fromDate, setFromDate] = useState<Dayjs | null>(null);
    const [toDate, setToDate] = useState<Dayjs | null>(null);

    const [tries, setTries] = useState<number>(0);

    const [activeAnimal, setActiveAnimal] = useState<AnimalRow | null>(null);

    const { fetchData: fetchDataFarmAnimals, response: responseFarmAnimals } = useFetch<FarmAnimalModel[]>(
        `proxy/farmcalendar/api/v1/FarmAnimals/?format=json&parcel=${session?.farm_parcel?.["@id"].split(':')[3]}`,
        {
            method: 'GET',
        }
    );

    const { fetchData: fetchDataGenerate, response: responseGenerate, error: errorGenerate } = useFetch<{ uuid: string }>(
        `proxy/reporting/api/v1/openagri-report/${reportHelper.reportType}/?`
        + `${reportHelper.animalID ? 'farm_animal_id=' + reportHelper.animalID : ''}`
        + `${reportHelper.fromDate ? 'from_date=' + reportHelper.fromDate : ''}`
        + `${reportHelper.toDate ? '&to_date=' + reportHelper.toDate : ''}`,
        {
            method: 'POST',
        }
    );

    const { fetchData: fetchDataReport, response: responseReport, error: errorReport } = useFetch<any[]>(
        `proxy/reporting/api/v1/openagri-report/${reportUUID}/?parcel_id=${session?.farm_parcel?.["@id"].split(':')[3]}`,
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

    useEffect(() => {
        if (responseFarmAnimals) {
            const formattedAnimals = responseFarmAnimals.map((a) => {
                return {
                    id: a["@id"],
                    parcel: a.hasAgriParcel["@type"],
                    nationalID: a.nationalID,
                    species: a.species,
                    breed: a.breed,
                    animalGroup: a.isMemberOfAnimalGroup.hasName,
                    entryDate: 'None', // TODO: this field is absent in response
                    leavingDate: 'None', // TODO: this field is absent in response
                    previousOwner: 'None', // TODO: this field is absent in response
                }
            })
            setAnimals(formattedAnimals);
        }
    }, [responseFarmAnimals])

    useEffect(() => {
        if (session?.farm_parcel) {
            fetchDataFarmAnimals();
        }
    }, [session?.farm_parcel])


    /** Reacting to the errors */
    useEffect(() => {
        if (errorGenerate || errorReport) {
            setLoadingReport(false);
            showSnackbar('error', 'Error generating report');
        }
    }, [errorGenerate, errorReport])


    const handleGenerateReport = (reportHelper: ReportHelper) => {
        setReportHelper(reportHelper);
    };

    const handleCloseDialog = () => {
        dialogProps.onClose();
        setFromDate(null)
        setToDate(null)
        setActiveAnimal(null);
    };

    interface AnimalRow {
        id: string;
        parcel: string;
        nationalID: string;
        species: string;
        breed: string;
        animalGroup: string;
        entryDate: string;
        leavingDate: string;
        previousOwner: string;
    }

    const parcelHeadCells: readonly HeadCell<AnimalRow>[] = [
        { id: 'parcel', numeric: false, label: 'Parcel' },
        { id: 'nationalID', numeric: false, label: 'National ID' },
        { id: 'species', numeric: false, label: 'Species' },
        { id: 'breed', numeric: false, label: 'Breed' },
        { id: 'animalGroup', numeric: false, label: 'Animal group' },
        { id: 'entryDate', numeric: false, label: 'Entry date' },
        { id: 'leavingDate', numeric: false, label: 'Leaving date' },
        { id: 'previousOwner', numeric: false, label: 'Previous Owner' },
    ];

    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            <ContentGuard condition={session?.farm_parcel}>
                <Box display={'flex'} flexDirection={'column'} gap={2}>
                    <Card variant="outlined">
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="body1">
                                Select a date range and press the button to generate a report or select a specific animal in the table
                            </Typography>
                            <DateRangeSelect
                                fromDate={fromDate}
                                setFromDate={setFromDate}
                                toDate={toDate}
                                setToDate={setToDate}>
                            </DateRangeSelect>
                            <Button
                                loading={loadingReport}
                                loadingPosition="start"
                                onClick={
                                    () => {
                                        setActiveAnimal(null);
                                        showDialog({
                                            title: `Generate animal report for selected date range`,
                                            variant: 'empty',
                                            children: <></>
                                        });
                                    }
                                }
                                // disabled={!selectedLocation || !fromDate || !toDate}
                                disabled={!fromDate || !toDate}
                                variant="contained">
                                Generate report
                            </Button>
                        </CardContent>
                    </Card>
                    <GenericSortableTable data={animals} headCells={parcelHeadCells} onRowClick={(animal: AnimalRow) => {
                        setActiveAnimal(animal);
                        setFromDate(null)
                        setToDate(null)
                        showDialog({
                            title: `Report actions for ${animal.species}`,
                            variant: 'empty',
                            children: <></>
                        });
                    }} />
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
                                        reportType: 'animal-report',
                                        animalID: activeAnimal?.id.split(':')[3],
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

export default FarmAnimalsReportPage;