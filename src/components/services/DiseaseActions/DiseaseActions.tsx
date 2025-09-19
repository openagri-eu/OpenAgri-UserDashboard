import { Box, Card, CardContent, Typography } from "@mui/material"
import { DiseaseActionsProps } from "./DiseaseActions.types"

const DiseaseActions: React.FC<DiseaseActionsProps> = ({ disease }) => {
    return (
        <Box display={'flex'} flexDirection={'column'} gap={2}>
            <Typography variant="body1">
                Disease description: {disease?.description}
            </Typography>
            <Typography variant="body1">
                EPPO code: {disease?.eppo_code}
            </Typography>
            <Typography variant="body1">
                Base GDD: {disease?.base_gdd}
            </Typography>
            <Typography variant="h6">GDD points</Typography>
            {disease?.gdd_points.map(gddp => {
                return <Card key={"GDDP-ID-" + gddp.id}>
                    <CardContent>
                        <div>From: {gddp.start}</div>
                        <div>To: {gddp.end}</div>
                        <div>Descriptor: {gddp.descriptor}</div>
                    </CardContent>
                </Card>
            })}
        </Box>
    )
}

export default DiseaseActions