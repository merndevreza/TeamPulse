"use client"

import React, { createContext, useContext, useState } from 'react';
import { DotCategory } from '../actions/api/types';

interface SelectedDot {
    label_id: number;
    label: string;
    dot_type: string;
    categoryName: string;
}

interface DotsContextValue {
    selectedDots: SelectedDot[];
    setSelectedDots: React.Dispatch<React.SetStateAction<SelectedDot[]>>;
    allDots: DotCategory[];
    setAllDots: React.Dispatch<React.SetStateAction<DotCategory[]>>;
    filteredDots: DotCategory[];
    setFilteredDots: React.Dispatch<React.SetStateAction<DotCategory[]>>;
}

const DotsContext = createContext<DotsContextValue | undefined>(undefined);

export const useDots = () => {
    const ctx = useContext(DotsContext);
    if (!ctx) {
        throw new Error('useDots must be used within a DotsProvider');
    }
    return ctx;
};

const DotsProvider = ({ children }: { children: React.ReactNode }) => {
    const [selectedDots, setSelectedDots] = useState<SelectedDot[]>([]);
    const [allDots, setAllDots] = useState<DotCategory[]>([]);
    const [filteredDots, setFilteredDots] = useState<DotCategory[]>(allDots);

    return (
        <DotsContext.Provider value={{ selectedDots, setSelectedDots, allDots, setAllDots, filteredDots, setFilteredDots }}>
            {children}
        </DotsContext.Provider>
    );
};

export default DotsProvider;