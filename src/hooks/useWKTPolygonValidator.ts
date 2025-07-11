import { useState } from "react";

const useWKTPolygonValidator = () => {
    const [severity, setSeverity] = useState<'info' | 'success' | 'error'>('info');
    const [polygonErrorMessage, setPolygonErrorMessage] = useState<string | null>(null);
    const [wktContent, setWktContent] = useState<string | null>(null);

    const parseCoordinates = (coordinatesString: string) => {
        return coordinatesString.split(',').map((coord) => {
            const point = coord.trim().split(/\s+/).map(Number);
            return point;
        });
    };

    const isValidCoordinate = (point: number[]) =>
        point.length === 2 && !isNaN(point[0]) && !isNaN(point[1]);

    const isClosedPolygon = (coordinates: number[][]) =>
        coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
        coordinates[0][1] === coordinates[coordinates.length - 1][1];

    const validateWKT = (content: string) => {
        const trimmedContent = content.trim();

        if (!trimmedContent.startsWith('POLYGON ((') || !trimmedContent.endsWith('))')) {
            throw new Error('Invalid WKT format. Ensure it starts with "POLYGON ((" and ends with "))".');
        }

        const coordinatesString = trimmedContent.slice(10, -2);
        const coordinates = parseCoordinates(coordinatesString);

        if (coordinates.length <= 1) {
            throw new Error('There need to be at least two coordinate pairs.');
        }

        if (!coordinates.every(isValidCoordinate)) {
            throw new Error('Coordinates must be valid numeric values.');
        }

        if (!isClosedPolygon(coordinates)) {
            throw new Error('The first and last points must match to form a closed polygon.');
        }

        return trimmedContent;
    };

    const handleWKTInput = (content: string) => {
        try {
            const validContent = validateWKT(content);
            setWktContent(validContent);
            setSeverity('success');
            setPolygonErrorMessage(null);
        } catch (error: any) {
            setWktContent(null);
            setSeverity('error');
            setPolygonErrorMessage(error.message);
        }
    };

    return { severity, polygonErrorMessage, wktContent, handleWKTInput };
};

export default useWKTPolygonValidator;