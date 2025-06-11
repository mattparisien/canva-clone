'use client';

import { Sidebar } from '@/components/organisms/Sidebar';
import { GLOBAL_NAVIGATION_ITEMS } from '@lib/constants/navigation';
import React, { useCallback } from 'react';

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {


    const handleItemClick = useCallback((itemId: string) => {
        // Handle navigation item click - could be used for analytics, routing logic, etc.
        console.log('Navigation item clicked:', itemId);
    }, []);

    return (
        <>
            <Sidebar
                items={GLOBAL_NAVIGATION_ITEMS}
                onItemClick={handleItemClick}
            />
            <main className="flex flex-col flex-1 pl-sidebar min-h-screen bg pt-10">
                <div className="flex-grow">
                    {children}
                </div>
            </main>
        </>
    );
}
