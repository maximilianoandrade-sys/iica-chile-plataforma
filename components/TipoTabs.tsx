"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export function TipoTabs() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Align default with ProjectListContainer: 'all' when no valid tipo is present
    const rawTipo = searchParams.get('tipo');
    const currentTipo =
        rawTipo === 'fondo' || rawTipo === 'licitacion' ? rawTipo : 'all';

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'all') {
            params.delete('tipo');
        } else {
            params.set('tipo', value);
        }
        // Reset page when changing tabs
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex justify-center mb-6">
            <Tabs value={currentTipo} onValueChange={handleTabChange}>
                <TabsList>
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="fondo">Fondos Concursables</TabsTrigger>
                    <TabsTrigger value="licitacion">Licitaciones / Procurement</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}
