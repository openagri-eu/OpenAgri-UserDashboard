import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { ContentGuardProps } from './ContentGuard.types';


const ContentGuard: React.FC<ContentGuardProps> = ({
    condition,
    message = "Please select a parcel",
    title = "Action required before content can be displayed",
    children,
}) => {
    if (condition) {
        return <>{children}</>;
    }

    return (
        <Card sx={{ minWidth: 275 }}>
            <CardContent>
                <Typography sx={{ color: 'text.secondary' }}>{title}</Typography>
                <Typography variant="h5" component="div">
                    {message}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default ContentGuard;