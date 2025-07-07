export interface ImageButtonGridProps {
    items: {
        url: string;
        title: string;
        f: () => void;
    }[]
}