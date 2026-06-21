/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { memo, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { useDefaultReaderSettings } from '@/features/reader/settings/ReaderSettingsMetadata.ts';
import { ReaderOverlay } from '@/features/reader/overlay/ReaderOverlay.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import type { GetChaptersReaderQuery, GetMangaReaderQuery } from '@/lib/graphql/generated/graphql.ts';
import { GET_MANGA_READER } from '@/lib/graphql/manga/MangaQuery.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { GET_CHAPTERS_READER } from '@/lib/graphql/chapter/ChapterQuery.ts';
import { TapZoneLayout } from '@/features/reader/tap-zones/TapZoneLayout.tsx';
import { ReaderRGBAFilter } from '@/features/reader/filters/ReaderRGBAFilter.tsx';
import { ReaderViewer } from '@/features/reader/viewer/ReaderViewer.tsx';
import { READER_BACKGROUND_TO_COLOR } from '@/features/reader/settings/ReaderSettings.constants.tsx';
import { ReaderHotkeys } from '@/features/reader/hotkeys/ReaderHotkeys.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useReaderResetStates } from '@/features/reader/hooks/useReaderResetStates.ts';
import { useReaderSetSettingsState } from '@/features/reader/hooks/useReaderSetSettingsState.ts';
import { useReaderShowSettingPreviewOnChange } from '@/features/reader/hooks/useReaderShowSettingPreviewOnChange.ts';
import { useReaderSetChaptersState } from '@/features/reader/hooks/useReaderSetChaptersState.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { useChapterListOptions } from '@/features/chapter/utils/ChapterList.util.tsx';
import { FALLBACK_MANGA } from '@/features/manga/Manga.constants.ts';
import {
    getReaderOverlayStore,
    getReaderStore,
    useReaderChaptersStore,
    useReaderSettingsStore,
    useReaderStore,
} from '@/features/reader/stores/ReaderStore.ts';
import { ReaderAutoScroll } from '@/features/reader/auto-scroll/ReaderAutoScroll.tsx';

const BaseKotatsuReader = () => {
    const { t } = useLingui();
    const manga = useReaderStore('manga');
    const { mangaChapters, initialChapter, chapterForDuplicatesHandling, currentChapter } = useReaderChaptersStore(
        'mangaChapters',
        'initialChapter',
        'chapterForDuplicatesHandling',
        'currentChapter',
    );
    const {
        shouldSkipDupChapters,
        shouldSkipFilteredChapters,
        backgroundColor,
        readingMode,
        tapZoneLayout,
        tapZoneInvertMode,
        shouldShowReadingModePreview,
        shouldShowTapZoneLayoutPreview,
    } = useReaderSettingsStore(
        'shouldSkipDupChapters',
        'shouldSkipFilteredChapters',
        'backgroundColor',
        'readingMode',
        'tapZoneLayout',
        'tapZoneInvertMode',
        'shouldShowReadingModePreview',
        'shouldShowTapZoneLayoutPreview',
    );
    const safeAreaInset = useReaderSettingsStore((state) => state.safeAreaInset);

    const scrollElementRef = useRef<HTMLDivElement | null>(null);

    const [areSettingsSet, setAreSettingsSet] = useState(false);

    const params = useParams<{ mangaId: string; chapterSourceOrder: string }>();
    const chapterSourceOrder = Number(params.chapterSourceOrder);
    const mangaId = Number(params.mangaId);

    const mangaResponse = requestManager.useGetManga<GetMangaReaderQuery>(GET_MANGA_READER, mangaId);
    const chaptersResponse = requestManager.useGetMangaChapters<GetChaptersReaderQuery>(GET_CHAPTERS_READER, mangaId);

    useAppTitle(
        !manga || !currentChapter
            ? t`Reader — Manga ${mangaId} Chapter ${chapterSourceOrder}`
            : `${manga.title}: ${currentChapter.name}`,
    );

    const {
        metadata: defaultSettingsMetadata,
        settings: defaultSettings,
        request: defaultSettingsResponse,
    } = useDefaultReaderSettings();
    const chapterListOptions = useChapterListOptions(manga ?? FALLBACK_MANGA);

    const isLoading =
        currentChapter === undefined ||
        !areSettingsSet ||
        mangaResponse.loading ||
        chaptersResponse.loading ||
        defaultSettingsResponse.loading;
    const error = mangaResponse.error ?? chaptersResponse.error ?? defaultSettingsResponse.error;

    useEffect(() => {
        getReaderStore().setManga(mangaResponse.data?.manga);
    }, [mangaResponse.data?.manga]);

    useReaderResetStates();
    useReaderSetSettingsState(
        mangaResponse,
        defaultSettingsResponse,
        defaultSettings,
        defaultSettingsMetadata,
        setAreSettingsSet,
    );
    useReaderShowSettingPreviewOnChange(
        isLoading,
        error,
        areSettingsSet,
        readingMode,
        tapZoneLayout,
        tapZoneInvertMode,
        shouldShowReadingModePreview,
        shouldShowTapZoneLayoutPreview,
    );
    useReaderSetChaptersState(
        chaptersResponse,
        chapterSourceOrder,
        mangaChapters,
        initialChapter,
        chapterForDuplicatesHandling,
        shouldSkipDupChapters,
        shouldSkipFilteredChapters,
        chapterListOptions,
    );

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => {
                    if (mangaResponse.error) {
                        mangaResponse.refetch().catch(defaultPromiseErrorHandler('KotatsuReader::refetchManga'));
                    }

                    if (defaultSettingsResponse.error) {
                        defaultSettingsResponse
                            .refetch()
                            .catch(defaultPromiseErrorHandler('KotatsuReader::refetchDefaultSettings'));
                    }

                    if (chaptersResponse.error) {
                        chaptersResponse.refetch().catch(defaultPromiseErrorHandler('KotatsuReader::refetchChapters'));
                    }
                }}
            />
        );
    }

    if (isLoading) {
        return (
            <Box
                sx={{
                    height: '100vh',
                    width: '100vw',
                    display: 'grid',
                    placeItems: 'center',
                }}
            >
                <LoadingPlaceholder />
            </Box>
        );
    }

    if (currentChapter === null) {
        return <EmptyViewAbsoluteCentered message={t`Chapter does not exist`} />;
    }

    if (!manga || !currentChapter) {
        return null;
    }

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                display: 'flex',
                flexDirection: 'column',
                width: '100vw',
                height: '100vh',
                pt: safeAreaInset.top ? 'env(safe-area-inset-top)' : undefined,
                pb: safeAreaInset.bottom ? 'env(safe-area-inset-bottom)' : undefined,
                pr: safeAreaInset.right ? 'env(safe-area-inset-right)' : undefined,
                pl: safeAreaInset.left ? 'env(safe-area-inset-left)' : undefined,
                overflow: 'hidden',
                backgroundColor: READER_BACKGROUND_TO_COLOR[backgroundColor],
                zIndex: 1300, // Make sure it covers the app, mimicking a full screen reader
            }}
        >
            <ReaderViewer ref={scrollElementRef} />
            <TapZoneLayout />
            <ReaderRGBAFilter />
            <ReaderAutoScroll />
            <ReaderHotkeys scrollElementRef={scrollElementRef} />
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
                <ReaderOverlay />
                {!scrollElementRef.current && (
                    <Box
                        onClick={() => getReaderOverlayStore().setIsVisible(!getReaderOverlayStore().isVisible)}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'transparent',
                            pointerEvents: 'auto',
                        }}
                    />
                )}
            </Box>
        </Box>
    );
};

export const KotatsuReader = memo(BaseKotatsuReader);
