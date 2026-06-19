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
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ButtonBase from '@mui/material/ButtonBase';
import { Link } from 'react-router-dom';
import { KOTATSU_COLORS, KOTATSU_RADIUS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';

type KotatsuHistoryItemProps = {
    mangaId: number;
    mangaTitle: string;
    chapterName: string;
    thumbnailUrl?: string | null;
    readAt: string;
    mangaLink: string;
    continueLink?: string;
    onDelete?: () => void;
};

export const KotatsuHistoryItem = ({
    mangaTitle,
    chapterName,
    thumbnailUrl,
    readAt,
    mangaLink,
    continueLink,
    onDelete,
}: KotatsuHistoryItemProps) => (
    <Stack
        direction="row"
        sx={{
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1,
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' },
        }}
    >
        {/* Thumbnail */}
        <ButtonBase
            component={Link}
            to={mangaLink}
            sx={{ borderRadius: KOTATSU_RADIUS.card, flexShrink: 0 }}
        >
            <Box
                component="img"
                src={thumbnailUrl ?? ''}
                alt={mangaTitle}
                loading="lazy"
                sx={{
                    width: 48,
                    height: 68,
                    objectFit: 'cover',
                    borderRadius: '8px',
                    backgroundColor: KOTATSU_COLORS.surface,
                }}
            />
        </ButtonBase>

        {/* Info */}
        <Stack sx={{ flex: 1, minWidth: 0, gap: 0.25 }}>
            <Typography
                sx={{
                    color: KOTATSU_COLORS.textPrimary,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {mangaTitle}
            </Typography>
            <Typography
                sx={{
                    color: KOTATSU_COLORS.textSecondary,
                    fontSize: '0.8rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {chapterName}
            </Typography>
            <Typography
                sx={{
                    color: KOTATSU_COLORS.textMuted,
                    fontSize: '0.7rem',
                }}
            >
                {readAt}
            </Typography>
        </Stack>

        {/* Actions */}
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
            {continueLink && (
                <IconButton
                    component={Link}
                    to={continueLink}
                    size="small"
                    sx={{ color: KOTATSU_COLORS.textPrimary }}
                >
                    <PlayArrowIcon />
                </IconButton>
            )}
            {onDelete && (
                <IconButton
                    onClick={onDelete}
                    size="small"
                    sx={{ color: KOTATSU_COLORS.textMuted }}
                >
                    <DeleteOutlineIcon fontSize="small" />
                </IconButton>
            )}
        </Stack>
    </Stack>
);

type KotatsuHistoryDateHeaderProps = {
    date: string;
};

export const KotatsuHistoryDateHeader = ({ date }: KotatsuHistoryDateHeaderProps) => (
    <Box sx={{ px: 2, pt: 2, pb: 0.5 }}>
        <Typography
            sx={{
                color: KOTATSU_COLORS.textSecondary,
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
            }}
        >
            {date}
        </Typography>
    </Box>
);
