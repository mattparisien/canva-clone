"use client"
import { NavigationSidebar } from '@components/layout/navigation-sidebar';
import { GLOBAL_NAVIGATION_ITEMS } from '@lib/constants/navigation';
import React from 'react';

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const handleItemClick = (itemId: string) => {
        // Handle navigation item clicks if needed
        console.log('Navigation item clicked:', itemId);
    };

    return (
        <>
            <NavigationSidebar items={GLOBAL_NAVIGATION_ITEMS} onItemClick={handleItemClick} />
            <main className="flex flex-col flex-1 pl-sidebar min-h-screen bg pt-10">
                <div className="flex-grow">
                    {children}
                </div>
            </main>
        </>
    );
}
