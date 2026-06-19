/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Typography from '@mui/material/Typography';
import React, { useCallback, useMemo, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { StyledGroupedVirtuoso } from '@/base/components/virtuoso/StyledGroupedVirtuoso.tsx';
import { StyledGroupHeader } from '@/base/components/virtuoso/StyledGroupHeader.tsx';
import { StyledGroupItemWrapper } from '@/base/components/virtuoso/StyledGroupItemWrapper.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { VirtuosoUtil } from '@/lib/virtuoso/Virtuoso.util.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { ChapterHistoryCard } from '@/features/history/components/ChapterHistoryCard.tsx';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { KotatsuScreenLayout } from '@/features/kotatsu-ui/components/KotatsuScreenLayout.tsx';
import { KotatsuContinueFab } from '@/features/kotatsu-ui/components/KotatsuContinueFab.tsx';
import { useKotatsuMainScreen } from '@/features/kotatsu-ui/hooks/useKotatsuMainScreen.ts';
import type { KotatsuFilterId } from '@/features/kotatsu-ui/components/KotatsuFilterChips.tsx';
import { KOTATSU_COLORS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';

export const History: React.FC = () => {
    const { t } = useLingui();
    const { openSettings } = useKotatsuMainScreen();
    const [activeFilters, setActiveFilters] = useState<KotatsuFilterId[]>([]);

    useAppTitle(t`History`);

    const {
        data: chapterHistoryData,
        loading: isLoading,
        error,
        fetchMore,
        refetch,
    } = requestManager.useGetRecentlyReadChapters(undefined, {
        fetchPolicy: 'cache-and-network',
    });
    const hasNextPage = !!chapterHistoryData?.chapters.pageInfo.hasNextPage;
    const endCursor = chapterHistoryData?.chapters.pageInfo.endCursor;
    const readEntries = chapterHistoryData?.chapters.nodes ?? STABLE_EMPTY_ARRAY;
    const groupedHistory = useMemo(
        () => Object.entries(Chapters.groupByDate(readEntries, 'lastReadAt')),
        [readEntries],
    );
    const groupCounts: number[] = useMemo(
        () => groupedHistory.map((group) => group[VirtuosoUtil.ITEMS].length),
        [groupedHistory],
    );

    const computeItemKey = VirtuosoUtil.useCreateGroupedComputeItemKey(
        groupCounts,
        useCallback((index) => groupedHistory[index][VirtuosoUtil.GROUP], [groupedHistory]),
        useCallback((index) => readEntries[index].id, [readEntries]),
    );

    const loadMore = useCallback(() => {
        if (!hasNextPage) {
            return;
        }

        fetchMore({ variables: { offset: readEntries.length } });
    }, [hasNextPage, endCursor]);

    const handleFilterToggle = useCallback((filter: KotatsuFilterId) => {
        setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]));
    }, []);

    const content = (() => {
        if (error) {
            return (
                <EmptyViewAbsoluteCentered
                    message={t`Unable to load data`}
                    messageExtra={getErrorMessage(error)}
                    retry={() => refetch().catch(defaultPromiseErrorHandler('History::refetch'))}
                />
            );
        }

        if (!isLoading && readEntries.length === 0) {
            return <EmptyViewAbsoluteCentered message={t`You have not read any series yet.`} />;
        }

        return (
            <StyledGroupedVirtuoso
                persistKey="history"
                components={{
                    Footer: () => (isLoading ? <LoadingPlaceholder usePadding /> : null),
                }}
                overscan={window.innerHeight * 0.5}
                endReached={loadMore}
                groupCounts={groupCounts}
                groupContent={(index) => (
                    <StyledGroupHeader isFirstItem={index === 0}>
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{ color: KOTATSU_COLORS.textPrimary, fontWeight: 600, px: 2 }}
                        >
                            {groupedHistory[index][VirtuosoUtil.GROUP]}
                        </Typography>
                    </StyledGroupHeader>
                )}
                computeItemKey={computeItemKey}
                itemContent={(index) => (
                    <StyledGroupItemWrapper>
                        <ChapterHistoryCard chapter={readEntries[index]} />
                    </StyledGroupItemWrapper>
                )}
            />
        );
    })();

    return (
        <KotatsuScreenLayout
            showFilters
            activeFilters={activeFilters}
            onFilterToggle={handleFilterToggle}
            onMenuClick={openSettings}
        >
            {content}
            <KotatsuContinueFab />
        </KotatsuScreenLayout>
    );
};
