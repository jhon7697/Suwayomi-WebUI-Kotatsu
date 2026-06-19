/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';

export const useKotatsuMainScreen = () => {
    const { setTitle, setAction, setAppBarHeight } = useNavBarContext();
    const isMobileWidth = MediaQuery.useIsMobileWidth();
    const navigate = useNavigate();

    useLayoutEffect(() => {
        if (!isMobileWidth) {
            return;
        }

        setTitle('');
        setAction(null);
        setAppBarHeight(0);

        return () => {
            setAppBarHeight(0);
        };
    }, [isMobileWidth, setTitle, setAction, setAppBarHeight]);

    const openSettings = () => navigate(AppRoutes.settings.path);

    return { isMobileWidth, openSettings };
};
