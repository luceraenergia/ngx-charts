import { EventEmitter, OnChanges, TemplateRef } from '@angular/core';
import { DataItem } from '../models/chart-data.model';
export declare enum D0Types {
    positive = "positive",
    negative = "negative"
}
export declare class SeriesVerticalComponent implements OnChanges {
    dims: any;
    type: string;
    series: any;
    xScale: any;
    yScale: any;
    colors: any;
    gradient: boolean;
    activeEntries: any[];
    seriesName: string;
    tooltipDisabled: boolean;
    tooltipTemplate: TemplateRef<any>;
    roundEdges: boolean;
    animations: boolean;
    showDataLabel: boolean;
    dataLabelFormatting: any;
    noBarWhenZero: boolean;
    barWidth: number;
    noValueBarHeight: number;
    noValueLabel: string;
    showSummaryTooltip: boolean;
    showSummaryTooltipOnAllArea: boolean;
    barPadding: number;
    activateSerie: boolean;
    tooltipShowTimeout: number;
    select: EventEmitter<{}>;
    activate: EventEmitter<{}>;
    deactivate: EventEmitter<{}>;
    activateSibling: EventEmitter<{}>;
    dataLabelHeightChanged: EventEmitter<{}>;
    tooltipPlacement: string;
    tooltipType: string;
    bars: any;
    x: any;
    y: any;
    barsForDataLabels: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        total: number;
        series: string;
    }>;
    ngOnChanges(changes: any): void;
    update(): void;
    updateDataLabels(): void;
    updateTooltipSettings(): void;
    isActive(entry: any): boolean;
    isOtherActive(entry: any): boolean;
    findCurrentActiveEntry(d: any, entry: any): boolean;
    onClick(data: DataItem): void;
    getLabel(dataItem: any): string;
    trackBy(index: any, bar: any): string;
    trackDataLabelBy(index: any, barLabel: any): string;
    serializedBarData(bar: any): string;
}
