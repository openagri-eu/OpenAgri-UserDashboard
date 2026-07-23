import { alpha, Box, IconButton, InputAdornment, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useEffect, useMemo, useRef, useState } from "react";
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import { FarmParcelModel } from "@models/FarmParcel";
import { WinerySelectionListProps } from "./WinerySelectionList.types";

import placeholder from '/parcel-placeholder.png';

interface FarmHeaderItem {
    type: 'farm-header';
    farmId: string;
    farmName: string;
    wineryCount: number;
    collapsed: boolean;
}

interface WineryRowItem {
    type: 'winery';
    winery: FarmParcelModel;
}

type Item = FarmHeaderItem | WineryRowItem;

const ROW_HEIGHT_DESKTOP = 112;
const ROW_HEIGHT_MOBILE = 80;
const HEADER_HEIGHT = 56;
const LIST_HEIGHT_DESKTOP = 480;
const LIST_HEIGHT_MOBILE = 360;

const UNKNOWN_FARM = '__unknown__';

const matchesSearch = (w: FarmParcelModel, q: string, farmName: string): boolean => {
    if (!q) return true;
    const hay = [
        w.identifier, w.category, w.inRegion, w.hasToponym, w.description, farmName,
    ].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q.toLowerCase());
};

const WinerySelectionList: React.FC<WinerySelectionListProps> = ({ wineries, selectedWineryId, f, farmNamesById = {} }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const ROW_HEIGHT = isMobile ? ROW_HEIGHT_MOBILE : ROW_HEIGHT_DESKTOP;
    const LIST_HEIGHT = isMobile ? LIST_HEIGHT_MOBILE : LIST_HEIGHT_DESKTOP;
    const [search, setSearch] = useState<string>('');
    const [collapsedFarms, setCollapsedFarms] = useState<Set<string>>(new Set());
    const listRef = useRef<VariableSizeList>(null);

    const toggleFarm = (id: string) => {
        setCollapsedFarms(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const items = useMemo<Item[]>(() => {
        const grouped = new Map<string, FarmParcelModel[]>();
        for (const w of wineries) {
            const fid = w.farm?.["@id"] ?? UNKNOWN_FARM;
            const farmName = fid === UNKNOWN_FARM ? '(no farm)' : (farmNamesById[fid] ?? 'Unknown farm');
            if (!matchesSearch(w, search, farmName)) continue;
            if (!grouped.has(fid)) grouped.set(fid, []);
            grouped.get(fid)!.push(w);
        }

        const sortedFarmIds = Array.from(grouped.keys()).sort((a, b) => {
            const na = a === UNKNOWN_FARM ? '' : (farmNamesById[a] ?? a);
            const nb = b === UNKNOWN_FARM ? '' : (farmNamesById[b] ?? b);
            return na.localeCompare(nb);
        });

        const out: Item[] = [];
        const isSearching = !!search.trim();
        for (const fid of sortedFarmIds) {
            const collapsed = !isSearching && collapsedFarms.has(fid);
            const farmName = fid === UNKNOWN_FARM ? '(no farm)' : (farmNamesById[fid] ?? 'Unknown farm');
            const farmWineries = grouped.get(fid)!;
            out.push({
                type: 'farm-header',
                farmId: fid,
                farmName,
                wineryCount: farmWineries.length,
                collapsed,
            });
            if (!collapsed) {
                for (const w of farmWineries) {
                    out.push({ type: 'winery', winery: w });
                }
            }
        }
        return out;
    }, [wineries, search, collapsedFarms, farmNamesById]);

    const getItemSize = (index: number) => items[index].type === 'farm-header' ? HEADER_HEIGHT : ROW_HEIGHT;

    useEffect(() => {
        listRef.current?.resetAfterIndex(0);
    }, [items]);

    const Row = ({ index, style }: ListChildComponentProps) => {
        const item = items[index];
        if (item.type === 'farm-header') {
            return (
                <Box
                    style={style}
                    onClick={() => toggleFarm(item.farmId)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        padding: 1.5,
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        width: '100%',
                        overflow: 'hidden',
                        backgroundColor: theme.palette.background.default,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) },
                    }}
                >
                    {item.collapsed ? <ChevronRightIcon /> : <ExpandMoreIcon />}
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flex: 1, minWidth: 0 }} noWrap>
                        {item.farmName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {item.wineryCount} winery{item.wineryCount === 1 ? '' : 's'}
                    </Typography>
                </Box>
            );
        }

        const w = item.winery;
        const isSelected = w["@id"] === selectedWineryId;
        const wineryImage = (w.depiction || '').trim() || placeholder;
        return (
            <Box style={style} sx={{ padding: 0.5, boxSizing: 'border-box', width: '100%' }}>
                <Box
                    onClick={() => f(w)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: { xs: 1, sm: 2 },
                        boxShadow: 2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        height: '100%',
                        boxSizing: 'border-box',
                        width: '100%',
                        overflow: 'hidden',
                        transition: 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                        backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.08) : theme.palette.background.paper,
                        '&:hover': {
                            backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.2) : alpha('rgb(0, 0, 0)', 0.04),
                        }
                    }}
                >
                    <Box
                        component="img"
                        src={wineryImage}
                        alt={`Image of ${w.identifier}`}
                        sx={{
                            width: { xs: 56, sm: 80 },
                            height: { xs: 56, sm: 80 },
                            borderRadius: 1,
                            marginRight: { xs: 1, sm: 2 },
                            flexShrink: 0,
                        }}
                    />
                    <Box sx={{ overflow: 'hidden', minWidth: 0, flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }} noWrap>
                            {w.identifier}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {[w.category, w.inRegion].filter(Boolean).join(' · ') || w["@type"]}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        );
    };

    if (wineries.length === 0) {
        return <Typography color="text.secondary">No wineries available.</Typography>;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%', minWidth: 0, overflow: 'hidden' }}>
            <TextField
                size="small"
                placeholder="Search by identifier, region, toponym, farm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                        endAdornment: search ? (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearch('')} aria-label="clear">
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : undefined,
                    }
                }}
            />
            {items.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2 }}>No matching wineries.</Typography>
            ) : (
                <VariableSizeList
                    ref={listRef}
                    height={Math.min(LIST_HEIGHT, items.reduce((acc, _, i) => acc + getItemSize(i), 0))}
                    itemCount={items.length}
                    itemSize={getItemSize}
                    width="100%"
                    style={{ overflowX: 'hidden' }}
                >
                    {Row}
                </VariableSizeList>
            )}
        </Box>
    );
};

export default WinerySelectionList;
