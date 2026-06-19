/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import { useNavigate } from 'react-router-dom';
import { KOTATSU_COLORS, KOTATSU_RADIUS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';

type KotatsuMangaHeaderProps = {
    title: string;
    author?: string | null;
    artist?: string | null;
    status?: string;
    description?: string | null;
    thumbnailUrl?: string | null;
    genres?: string[];
    inLibrary?: boolean;
    onToggleLibrary?: () => void;
    onShare?: () => void;
};

export const KotatsuMangaHeader = ({
    title,
    author,
    artist,
    status,
    description,
    thumbnailUrl,
    genres = [],
    inLibrary = false,
    onToggleLibrary,
    onShare,
}: KotatsuMangaHeaderProps) => {
    const navigate = useNavigate();

    return (
        <Box sx={{ position: 'relative' }}>
            {/* Blurred background cover */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100%',
                    overflow: 'hidden',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(
                            to bottom,
                            rgba(0,0,0,0.3) 0%,
                            rgba(0,0,0,0.6) 50%,
                            ${KOTATSU_COLORS.background} 100%
                        )`,
                    },
                }}
            >
                {thumbnailUrl && (
                    <Box
                        component="img"
                        src={thumbnailUrl}
                        alt=""
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: 'blur(20px) brightness(0.5)',
                            transform: 'scale(1.1)',
                        }}
                    />
                )}
            </Box>

            {/* Top bar */}
            <Stack
                direction="row"
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pt: 'max(8px, env(safe-area-inset-top))',
                    px: 1,
                }}
            >
                <IconButton onClick={() => navigate(-1)} sx={{ color: KOTATSU_COLORS.textPrimary }}>
                    <ArrowBackIcon />
                </IconButton>
                <Stack direction="row">
                    {onShare && (
                        <IconButton onClick={onShare} sx={{ color: KOTATSU_COLORS.textPrimary }}>
                            <ShareIcon />
                        </IconButton>
                    )}
                </Stack>
            </Stack>

            {/* Content */}
            <Stack
                direction="row"
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    px: 2,
                    pb: 2,
                    pt: 1,
                    gap: 2,
                }}
            >
                {/* Cover image */}
                <Box
                    component="img"
                    src={thumbnailUrl ?? ''}
                    alt={title}
                    sx={{
                        width: 120,
                        height: 170,
                        objectFit: 'cover',
                        borderRadius: KOTATSU_RADIUS.card,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        flexShrink: 0,
                        backgroundColor: KOTATSU_COLORS.surface,
                    }}
                />

                {/* Info */}
                <Stack sx={{ flex: 1, minWidth: 0, justifyContent: 'flex-end', gap: 0.5 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            color: KOTATSU_COLORS.textPrimary,
                            fontSize: '1.15rem',
                            fontWeight: 700,
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {title}
                    </Typography>
                    {author && (
                        <Typography
                            sx={{
                                color: KOTATSU_COLORS.textSecondary,
                                fontSize: '0.85rem',
                            }}
                        >
                            {author}
                            {artist && artist !== author ? ` · ${artist}` : ''}
                        </Typography>
                    )}
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mt: 0.5 }}>
                        {status && (
                            <Chip
                                label={status}
                                size="small"
                                variant="outlined"
                                sx={{
                                    fontSize: '0.7rem',
                                    height: 24,
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    color: KOTATSU_COLORS.textSecondary,
                                }}
                            />
                        )}
                        <IconButton
                            onClick={onToggleLibrary}
                            size="small"
                            sx={{ color: inLibrary ? KOTATSU_COLORS.badge : KOTATSU_COLORS.textSecondary }}
                        >
                            {inLibrary ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                        </IconButton>
                    </Stack>
                </Stack>
            </Stack>

            {/* Description */}
            {description && (
                <Box sx={{ position: 'relative', zIndex: 1, px: 2, pb: 1.5 }}>
                    <Typography
                        sx={{
                            color: KOTATSU_COLORS.textSecondary,
                            fontSize: '0.82rem',
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {description}
                    </Typography>
                </Box>
            )}

            {/* Genres */}
            {genres.length > 0 && (
                <Stack
                    direction="row"
                    sx={{
                        position: 'relative',
                        zIndex: 1,
                        px: 2,
                        pb: 2,
                        gap: 0.75,
                        flexWrap: 'wrap',
                    }}
                >
                    {genres.map((genre) => (
                        <Chip
                            key={genre}
                            label={genre}
                            size="small"
                            variant="outlined"
                            sx={{
                                fontSize: '0.7rem',
                                height: 26,
                                borderColor: 'rgba(255,255,255,0.15)',
                                color: KOTATSU_COLORS.textSecondary,
                                borderRadius: KOTATSU_RADIUS.chip,
                            }}
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
};
