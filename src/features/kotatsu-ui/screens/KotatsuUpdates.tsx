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
import { KotatsuChapterItem } from '@/features/kotatsu-ui/components/KotatsuChapterItem.tsx';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { KotatsuScreenLayout } from '@/features/kotatsu-ui/components/KotatsuScreenLayout.tsx';
import { useKotatsuMainScreen } from '@/features/kotatsu-ui/hooks/useKotatsuMainScreen.ts';
import { KOTATSU_COLORS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import type { KotatsuFilterId } from '@/features/kotatsu-ui/components/KotatsuFilterChips.tsx';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';

export const KotatsuUpdates: React.FC = () => {
    const { t } = useLingui();
    const { openSettings } = useKotatsuMainScreen();
    const [activeFilters, setActiveFilters] = useState<KotatsuFilterId[]>([]);

    useAppTitle(t`Updates`);

    const {
        data: chapterUpdateData,
        loading: isLoading,
        error,
        fetchMore,
        refetch,
    } = requestManager.useGetRecentlyUpdatedChapters(undefined, {
        fetchPolicy: 'cache-and-network',
    });
    const hasNextPage = !!chapterUpdateData?.chapters.pageInfo.hasNextPage;
    const endCursor = chapterUpdateData?.chapters.pageInfo.endCursor;
    const updateEntries = chapterUpdateData?.chapters.nodes ?? STABLE_EMPTY_ARRAY;
    const groupedUpdates = useMemo(
        () => Object.entries(Chapters.groupByDate(updateEntries, 'fetchedAt')),
        [updateEntries],
    );
    const groupCounts: number[] = useMemo(
        () => groupedUpdates.map((group) => group[VirtuosoUtil.ITEMS].length),
        [groupedUpdates],
    );

    const computeItemKey = VirtuosoUtil.useCreateGroupedComputeItemKey(
        groupCounts,
        useCallback((index) => groupedUpdates[index][VirtuosoUtil.GROUP], [groupedUpdates]),
        useCallback((index) => updateEntries[index].id, [updateEntries]),
    );

    const loadMore = useCallback(() => {
        if (!hasNextPage) {
            return;
        }

        fetchMore({ variables: { offset: updateEntries.length } });
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
                    retry={() => refetch().catch(defaultPromiseErrorHandler('KotatsuUpdates::refetch'))}
                />
            );
        }

        if (!isLoading && updateEntries.length === 0) {
            return <EmptyViewAbsoluteCentered message={t`No recent updates.`} />;
        }

        return (
            <StyledGroupedVirtuoso
                persistKey="updates"
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
                            {groupedUpdates[index][VirtuosoUtil.GROUP]}
                        </Typography>
                    </StyledGroupHeader>
                )}
                computeItemKey={computeItemKey}
                itemContent={(index) => {
                    const chapter = updateEntries[index];
                    const {manga} = chapter;
                    return (
                        <StyledGroupItemWrapper>
                            <KotatsuChapterItem
                                name={chapter.name}
                                scanlator={chapter.scanlator}
                                uploadDate={chapter.fetchedAt?.toString()}
                                isRead={chapter.isRead}
                                isBookmarked={chapter.isBookmarked}
                                isDownloaded={chapter.isDownloaded}
                                to={AppRoutes.reader.path(chapter.id, manga.id)}
                                lastPageRead={undefined}
                                pageCount={undefined}
                            />
                        </StyledGroupItemWrapper>
                    );
                }}
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
        </KotatsuScreenLayout>
    );
};
