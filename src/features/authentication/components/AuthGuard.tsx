/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { AuthManager } from '@/features/authentication/AuthManager.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';

export const AuthGuard = ({ children }: { children: ReactNode }) => {
    useEffect(() => {
        if (AuthManager.isAuthInitialized()) {
            return;
        }

        AuthManager.setAuthRequired(false);
        AuthManager.setAuthInitialized(true);
        requestManager.processQueues();
    }, []);

    return children;
};
