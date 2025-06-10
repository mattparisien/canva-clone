'use client';

import React from 'react';
import { Header } from '@/components/organisms/Header';
import { NavigationSidebar } from '@/components/organisms/NavigationSidebar';
import { GLOBAL_NAVIGATION_ITEMS } from '@lib/constants/navigation';

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const handleItemClick = (itemId: string) => {
        // Handle navigation item click - could be used for analytics, routing logic, etc.
        console.log('Navigation item clicked:', itemId);
    };

    return (
        <>
            <NavigationSidebar 
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
