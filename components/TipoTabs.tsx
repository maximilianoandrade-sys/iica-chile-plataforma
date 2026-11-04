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
        <div className="flex justify-center mb-6 max-w-full overflow-x-auto px-1">
            <Tabs value={currentTipo} onValueChange={handleTabChange}>
            <TabsList className="min-w-max">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="fondo">
                        <span className="sm:hidden">Fondos</span>
                        <span className="hidden sm:inline">Fondos Concursables</span>
                    </TabsTrigger>
                    <TabsTrigger value="licitacion">
                        <span className="sm:hidden">Licitaciones</span>
                        <span className="hidden sm:inline">Licitaciones / Procurement</span>
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}
