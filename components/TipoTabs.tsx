"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export function TipoTabs() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentTipo = searchParams.get('tipo') || 'fondo';

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === 'fondo') {
            params.delete('tipo'); // default is fondo, or maybe we explicitly set it? Wait, let's explicitly set it.
            params.set('tipo', 'fondo');
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
                    <TabsTrigger value="fondo">Fondos Concursables</TabsTrigger>
                    <TabsTrigger value="licitacion">Licitaciones / Procurement</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}
