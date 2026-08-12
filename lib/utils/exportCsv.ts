import type { Project } from '@/lib/data';

function escapeXml(unsafe: any): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Exporta proyectos a un archivo Excel (.xls SpreadsheetML) ordenado,
 * con estilos institucionales IICA, formato de moneda, bloque de KPIs
 * y fórmulas nativas de Excel (=SUM, =COUNTA, =AVERAGE, =COUNTIF).
 */
export function exportProjectsToExcel(projects: Project[], filename: string = 'Radar_IICA_Chile_Convocatorias.xls'): void {
  if (!projects || projects.length === 0) return;

  const totalRows = projects.length;
  const startDataRow = 12; // La fila de datos inicia en la línea 12 de Excel
  const endDataRow = startDataRow + totalRows - 1;

  const todayStr = new Date().toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-microsoft-com:office:office">
  <Title>Radar de Oportunidades IICA Chile</Title>
  <Subject>Reporte Ejecutivo Convocatorias Silvoagropecuarias y Clima</Subject>
  <Author>Instituto Interamericano de Cooperacion para la Agricultura (IICA)</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <!-- Estilo Base -->
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1A202C"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  
  <!-- Estilos Encabezado Institucional -->
  <Style ss:ID="HeaderTitle">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#002060"/>
  </Style>
  <Style ss:ID="HeaderSubtitle">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Italic="1" ss:Color="#4A5568"/>
  </Style>
  
  <!-- Estilos Tarjetas KPIs / Resumen de Fórmulas -->
  <Style ss:ID="KpiTitle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="9" ss:Bold="1" ss:Color="#4A5568"/>
   <Interior ss:Color="#EDF2F7" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
   </Borders>
  </Style>
  <Style ss:ID="KpiValue">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="13" ss:Bold="1" ss:Color="#002060"/>
   <Interior ss:Color="#EDF2F7" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
   </Borders>
  </Style>
  <Style ss:ID="KpiValueCurrency">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="13" ss:Bold="1" ss:Color="#002060"/>
   <Interior ss:Color="#EDF2F7" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="$#,##0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E0"/>
   </Borders>
  </Style>
  
  <!-- Estilos de Cabecera de Tabla -->
  <Style ss:ID="ThStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#002060" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#001030"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#001030"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#2A4365"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#2A4365"/>
   </Borders>
  </Style>

  <!-- Estilos Filas de Datos -->
  <Style ss:ID="TdNormal">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="TdZebra">
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <!-- Estilos Específicos por Celda -->
  <Style ss:ID="TdCurrency">
   <Alignment ss:Horizontal="Right"/>
   <NumberFormat ss:Format="$#,##0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="TdCenter">
   <Alignment ss:Horizontal="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="TdBold">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <!-- Insignias de Estado -->
  <Style ss:ID="BadgeGreen">
   <Alignment ss:Horizontal="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#15803D"/>
   <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="BadgeAmber">
   <Alignment ss:Horizontal="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#B45309"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
 </Styles>

 <Worksheet ss:Name="Radar Oportunidades IICA">
  <Table ss:DefaultColumnWidth="110" ss:DefaultRowHeight="22">
   <!-- Anchos de Columna Optimizados -->
   <Column ss:Index="1" ss:Width="40"/>  <!-- N° -->
   <Column ss:Index="2" ss:Width="260"/> <!-- Convocatoria -->
   <Column ss:Index="3" ss:Width="160"/> <!-- Institucion -->
   <Column ss:Index="4" ss:Width="130"/> <!-- Monto Numerico -->
   <Column ss:Index="5" ss:Width="120"/> <!-- Monto Texto -->
   <Column ss:Index="6" ss:Width="90"/>  <!-- Estado -->
   <Column ss:Index="7" ss:Width="220"/> <!-- Exigencia Cofinanciamiento -->
   <Column ss:Index="8" ss:Width="100"/> <!-- Fecha Cierre -->
   <Column ss:Index="9" ss:Width="170"/> <!-- Cobertura -->
   <Column ss:Index="10" ss:Width="170"/> <!-- Sector -->
   <Column ss:Index="11" ss:Width="100"/> <!-- Viabilidad IICA -->
   <Column ss:Index="12" ss:Width="120"/> <!-- Rol IICA -->
   <Column ss:Index="13" ss:Width="250"/> <!-- Bases Oficiales -->

   <!-- Bloque 1: Titulo Institucional IICA -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="12" ss:StyleID="HeaderTitle">
     <Data ss:Type="String">INSTITUTO INTERAMERICANO DE COOPERACIÓN PARA LA AGRICULTURA — OFICINA CHILE</Data>
    </Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="12" ss:StyleID="HeaderSubtitle">
     <Data ss:Type="String">Radar de Oportunidades de Financiamiento Silvoagropecuario y Acción Climática · Generado el ${todayStr}</Data>
    </Cell>
   </Row>

   <Row ss:Height="12"><Cell/></Row> <!-- Espaciador -->

   <!-- Bloque 2: KPIs y Fórmulas Resumen de Excel -->
   <Row ss:Height="18">
    <Cell ss:Index="2" ss:StyleID="KpiTitle"><Data ss:Type="String">TOTAL CONVOCATORIAS</Data></Cell>
    <Cell ss:Index="4" ss:StyleID="KpiTitle"><Data ss:Type="String">SUMA FONDOS ESTIMADOS</Data></Cell>
    <Cell ss:Index="6" ss:StyleID="KpiTitle"><Data ss:Type="String">PROMEDIO POR FONDO</Data></Cell>
    <Cell ss:Index="8" ss:MergeAcross="1" ss:StyleID="KpiTitle"><Data ss:Type="String">100% SUBVENCIONADAS (SIN APORTE)</Data></Cell>
   </Row>

   <Row ss:Height="26">
    <!-- Fórmula: Total de Filas Registradas -->
    <Cell ss:Index="2" ss:StyleID="KpiValue" ss:Formula="=COUNTA(R${startDataRow}C2:R${endDataRow}C2)">
     <Data ss:Type="Number">${totalRows}</Data>
    </Cell>
    <!-- Fórmula: Suma de Montos Numericos -->
    <Cell ss:Index="4" ss:StyleID="KpiValueCurrency" ss:Formula="=SUM(R${startDataRow}C4:R${endDataRow}C4)">
     <Data ss:Type="Number">0</Data>
    </Cell>
    <!-- Fórmula: Promedio de Montos -->
    <Cell ss:Index="6" ss:StyleID="KpiValueCurrency" ss:Formula="=AVERAGE(R${startDataRow}C4:R${endDataRow}C4)">
     <Data ss:Type="Number">0</Data>
    </Cell>
    <!-- Fórmula: Conteo de Fondos Sin Cofinanciamiento -->
    <Cell ss:Index="8" ss:MergeAcross="1" ss:StyleID="KpiValue" ss:Formula='=COUNTIF(R${startDataRow}C7:R${endDataRow}C7,"100% Subvención (Sin Aporte)")'>
     <Data ss:Type="Number">0</Data>
    </Cell>
   </Row>

   <Row ss:Height="16"><Cell/></Row> <!-- Espaciador -->

   <!-- Bloque 3: Encabezados de la Tabla Principal -->
   <Row ss:Height="28">
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">N°</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Nombre Convocatoria / Proyecto</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Institución / Fuente</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Monto Subvención (CLP)</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Monto Original (Bases)</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Estado</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Exigencia Cofinanciamiento</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Fecha Cierre</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Cobertura / Región</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Sector / Categoría</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Viabilidad IICA</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Rol IICA</Data></Cell>
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Enlace Bases Oficiales</Data></Cell>
   </Row>

   <!-- Bloque 4: Filas de Datos -->
   ${projects.map((p, idx) => {
     const isZebra = idx % 2 === 1;
     const baseStyle = isZebra ? 'TdZebra' : 'TdNormal';
     const numericMonto = p.monto ?? 0;
     const cofinText = p.requiere_cofinanciamiento ? 'Aporte Propio Requerido' : '100% Subvención (Sin Aporte)';
     const cofinBadgeStyle = p.requiere_cofinanciamiento ? 'BadgeAmber' : 'BadgeGreen';
     const regionText = p.regiones?.join(', ') || p.region || p.ambito || 'Nacional';

     return `
   <Row ss:Height="24">
    <Cell ss:StyleID="TdCenter"><Data ss:Type="Number">${idx + 1}</Data></Cell>
    <Cell ss:StyleID="TdBold"><Data ss:Type="String">${escapeXml(p.nombre)}</Data></Cell>
    <Cell ss:StyleID="${baseStyle}"><Data ss:Type="String">${escapeXml(p.institucion)}</Data></Cell>
    <Cell ss:StyleID="TdCurrency"><Data ss:Type="Number">${numericMonto}</Data></Cell>
    <Cell ss:StyleID="${baseStyle}"><Data ss:Type="String">${escapeXml(p.montoTexto || (p.monto ? `$${p.monto}` : 'Ver bases'))}</Data></Cell>
    <Cell ss:StyleID="TdCenter"><Data ss:Type="String">${escapeXml(p.estadoPostulacion || p.estado || 'Abierta')}</Data></Cell>
    <Cell ss:StyleID="${cofinBadgeStyle}"><Data ss:Type="String">${escapeXml(cofinText)}</Data></Cell>
    <Cell ss:StyleID="TdCenter"><Data ss:Type="String">${escapeXml(p.fecha_cierre)}</Data></Cell>
    <Cell ss:StyleID="${baseStyle}"><Data ss:Type="String">${escapeXml(regionText)}</Data></Cell>
    <Cell ss:StyleID="${baseStyle}"><Data ss:Type="String">${escapeXml(p.categoria || 'Silvoagropecuario')}</Data></Cell>
    <Cell ss:StyleID="TdCenter"><Data ss:Type="String">${escapeXml(p.viabilidadIICA || 'Alta')}</Data></Cell>
    <Cell ss:StyleID="${baseStyle}"><Data ss:Type="String">${escapeXml(p.rolIICA || 'Asesor')}</Data></Cell>
    <Cell ss:StyleID="${baseStyle}"><Data ss:Type="String">${escapeXml(p.url_bases)}</Data></Cell>
   </Row>`;
   }).join('')}

  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-microsoft-com:office:excel">
   <PageSetup>
    <Layout x:Orientation="Landscape"/>
    <Header x:Margin="0.3"/>
    <Footer x:Margin="0.3"/>
    <PageMargins x:Bottom="0.75" x:Left="0.7" x:Right="0.7" x:Top="0.75"/>
   </PageSetup>
   <Selected/>
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitHorizontal>11</SplitHorizontal> <!-- Fija la cabecera al desplazar la tabla -->
   <TopRowBottomPane>11</TopRowBottomPane>
   <ActivePane>2</ActivePane>
   <Panes>
    <Pane>
     <Number>3</Number>
    </Pane>
    <Pane>
     <Number>2</Number>
    </Pane>
   </Panes>
   <ProtectObjects>False</ProtectObjects>
   <ProtectScenarios>False</ProtectScenarios>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const finalFilename = filename.endsWith('.xls') ? filename : filename.replace(/\.csv$/, '.xls');
  
  link.setAttribute('href', url);
  link.setAttribute('download', finalFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Retrocompatibilidad exportProjectsToCsv */
export function exportProjectsToCsv(projects: Project[], filename: string = 'Radar_IICA_Chile_Convocatorias.xls'): void {
  exportProjectsToExcel(projects, filename);
}
