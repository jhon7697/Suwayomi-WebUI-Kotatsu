/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Route, Routes, Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';

// Screens
import { KotatsuLibrary } from '@/features/kotatsu-ui/screens/KotatsuLibrary.tsx';
import { KotatsuUpdates } from '@/features/kotatsu-ui/screens/KotatsuUpdates.tsx';
import { KotatsuHistory } from '@/features/kotatsu-ui/screens/KotatsuHistory.tsx';
import { KotatsuExplore } from '@/features/kotatsu-ui/screens/KotatsuExplore.tsx';
import { KotatsuMore } from '@/features/kotatsu-ui/screens/KotatsuMore.tsx';
import { KotatsuMangaDetails } from '@/features/kotatsu-ui/screens/KotatsuMangaDetails.tsx';
import { KotatsuReader } from '@/features/kotatsu-ui/screens/KotatsuReader.tsx';
import { KotatsuSettings } from '@/features/kotatsu-ui/screens/KotatsuSettings.tsx';

// Components
import { KotatsuBottomNav } from '@/features/kotatsu-ui/components/KotatsuBottomNav.tsx';

const KotatsuAppLayout = () => {
    const location = useLocation();
    
    // Hide bottom navigation on certain full-screen pages like Reader and Manga Details
    const hideBottomNav = location.pathname.includes('/reader/') || location.pathname.includes('/manga/');

    return (
        <Box sx={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <Box sx={{ flex: 1, overflow: 'auto', pb: hideBottomNav ? 0 : '60px' }}>
                <Outlet />
            </Box>
            {!hideBottomNav && <KotatsuBottomNav />}
        </Box>
    );
};

export const KotatsuRoutes = () => {
    return (
        <Routes>
            <Route path="/kotatsu" element={<KotatsuAppLayout />}>
                <Route path="library" element={<KotatsuLibrary />} />
                <Route path="updates" element={<KotatsuUpdates />} />
                <Route path="history" element={<KotatsuHistory />} />
                <Route path="browse" element={<KotatsuExplore />} />
                <Route path="more" element={<KotatsuMore />} />
                
                <Route path="manga/:id" element={<KotatsuMangaDetails />} />
                <Route path="reader/:chapterId/:id" element={<KotatsuReader />} />
                <Route path="settings" element={<KotatsuSettings />} />
                
                {/* Fallback to library */}
                <Route path="*" element={<KotatsuLibrary />} />
            </Route>
        </Routes>
    );
};
