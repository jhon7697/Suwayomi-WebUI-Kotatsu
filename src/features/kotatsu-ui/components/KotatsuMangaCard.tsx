/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import ButtonBase from '@mui/material/ButtonBase';
import { Link } from 'react-router-dom';
import { KOTATSU_COLORS, KOTATSU_RADIUS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';

type KotatsuMangaCardProps = {
    id: number;
    title: string;
    thumbnailUrl?: string | null;
    unreadCount?: number;
    downloadCount?: number;
    inLibrary?: boolean;
    continueReading?: boolean;
    to: string;
    onLongPress?: () => void;
};

export const KotatsuMangaCard = ({
    title,
    thumbnailUrl,
    unreadCount = 0,
    downloadCount = 0,
    to,
}: KotatsuMangaCardProps) => (
    <ButtonBase
        component={Link}
        to={to}
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            width: '100%',
            textAlign: 'left',
            borderRadius: KOTATSU_RADIUS.card,
            overflow: 'hidden',
            textDecoration: 'none',
        }}
    >
        <Box sx={{ position: 'relative', width: '100%', paddingTop: '140%' }}>
            <Box
                component="img"
                src={thumbnailUrl ?? ''}
                alt={title}
                loading="lazy"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: KOTATSU_RADIUS.card,
                    backgroundColor: KOTATSU_COLORS.surface,
                }}
            />
            {/* Gradient overlay at bottom for title readability */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    borderRadius: `0 0 ${KOTATSU_RADIUS.card} ${KOTATSU_RADIUS.card}`,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                    pointerEvents: 'none',
                }}
            />
            {/* Title overlay */}
            <Typography
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    px: 1,
                    pb: 0.75,
                    pt: 2,
                    color: KOTATSU_COLORS.textPrimary,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {title}
            </Typography>
            {/* Unread badge */}
            {unreadCount > 0 && (
                <Badge
                    badgeContent={unreadCount}
                    color="error"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 12,
                        '& .MuiBadge-badge': {
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            minWidth: 18,
                            height: 18,
                            borderRadius: 9,
                            backgroundColor: KOTATSU_COLORS.badge,
                        },
                    }}
                />
            )}
            {/* Download badge */}
            {downloadCount > 0 && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        backgroundColor: KOTATSU_COLORS.primaryAccent,
                        color: '#000',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        px: 0.75,
                        py: 0.2,
                        borderRadius: 4,
                        lineHeight: 1.3,
                    }}
                >
                    {downloadCount}
                </Box>
            )}
        </Box>
    </ButtonBase>
);
