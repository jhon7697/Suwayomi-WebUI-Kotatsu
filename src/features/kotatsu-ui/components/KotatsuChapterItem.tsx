/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { Link } from 'react-router-dom';
import { KOTATSU_COLORS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';

type KotatsuChapterItemProps = {
    name: string;
    scanlator?: string | null;
    uploadDate?: string;
    isRead?: boolean;
    isBookmarked?: boolean;
    isDownloaded?: boolean;
    to: string;
    lastPageRead?: number;
    pageCount?: number;
};

export const KotatsuChapterItem = ({
    name,
    scanlator,
    uploadDate,
    isRead = false,
    isBookmarked = false,
    isDownloaded = false,
    to,
    lastPageRead,
    pageCount,
}: KotatsuChapterItemProps) => {
    const hasProgress = !isRead && lastPageRead != null && lastPageRead > 0 && pageCount != null && pageCount > 0;
    const progressPercent = hasProgress ? (lastPageRead / pageCount) * 100 : 0;

    return (
        <ListItemButton
            component={Link}
            to={to}
            sx={{
                px: 2,
                py: 1.25,
                gap: 1,
                opacity: isRead ? 0.5 : 1,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' },
            }}
        >
            <Stack sx={{ flex: 1, minWidth: 0, gap: 0.25 }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
                    {isBookmarked && (
                        <BookmarkIcon sx={{ fontSize: 16, color: KOTATSU_COLORS.primaryAccent }} />
                    )}
                    <Typography
                        sx={{
                            color: isRead ? KOTATSU_COLORS.textMuted : KOTATSU_COLORS.textPrimary,
                            fontSize: '0.9rem',
                            fontWeight: isRead ? 400 : 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {name}
                    </Typography>
                </Stack>
                <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                    {uploadDate && (
                        <Typography sx={{ color: KOTATSU_COLORS.textMuted, fontSize: '0.75rem' }}>
                            {uploadDate}
                        </Typography>
                    )}
                    {scanlator && (
                        <Typography sx={{ color: KOTATSU_COLORS.textMuted, fontSize: '0.75rem' }}>
                            · {scanlator}
                        </Typography>
                    )}
                    {hasProgress && (
                        <Typography sx={{ color: KOTATSU_COLORS.textMuted, fontSize: '0.75rem' }}>
                            · Page {lastPageRead}
                        </Typography>
                    )}
                </Stack>
                {/* Reading progress bar */}
                {hasProgress && (
                    <Box
                        sx={{
                            mt: 0.5,
                            height: 3,
                            borderRadius: 2,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            overflow: 'hidden',
                        }}
                    >
                        <Box
                            sx={{
                                height: '100%',
                                width: `${progressPercent}%`,
                                backgroundColor: KOTATSU_COLORS.primary,
                                borderRadius: 2,
                                transition: 'width 0.3s ease',
                            }}
                        />
                    </Box>
                )}
            </Stack>

            {isDownloaded && (
                <DownloadDoneIcon sx={{ fontSize: 18, color: KOTATSU_COLORS.textMuted, flexShrink: 0 }} />
            )}
        </ListItemButton>
    );
};
