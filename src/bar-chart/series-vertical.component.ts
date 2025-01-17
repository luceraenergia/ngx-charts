import { Component, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy, TemplateRef } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { formatLabel } from '../common/label.helper';
import { DataItem } from '../models/chart-data.model';

export enum D0Types {
  positive = 'positive',
  negative = 'negative'
}

@Component({
  selector: 'g[ngx-charts-series-vertical]',
  template: `
    <svg:g
      ngx-charts-bar
      *ngFor="let bar of bars; trackBy: trackBy"
      [@animationState]="'active'"
      [@.disabled]="!animations"
      [width]="bar.width"
      [height]="bar.height"
      [x]="bar.x"
      [y]="bar.y"
      [fill]="bar.color"
      [stops]="bar.gradientStops"
      [data]="bar.data"
      [orientation]="'vertical'"
      [roundEdges]="bar.roundEdges"
      [gradient]="gradient"
      [ariaLabel]="bar.ariaLabel"
      [isActive]="isActive(bar.data)"
      [isOtherActive]="isOtherActive(bar.data)"
      (select)="onClick($event)"
      (activate)="activate.emit($event)"
      (deactivate)="deactivate.emit($event)"
      (activateSibling)="activateSibling.emit($event)"
      ngx-tooltip
      [tooltipDisabled]="tooltipDisabled"
      [tooltipPlacement]="tooltipPlacement"
      [tooltipType]="tooltipType"
      [tooltipTitle]="tooltipTemplate ? undefined : bar.tooltipText"
      [tooltipTemplate]="tooltipTemplate"
      [tooltipContext]="bar.data"
      [tooltipShowTimeout]="tooltipShowTimeout"
      [noBarWhenZero]="noBarWhenZero"
      [animations]="animations"
      [attr.data-bardata]="serializedBarData(bar)"
    ></svg:g>
    <svg:g *ngIf="showDataLabel">
      <svg:g
        ngx-charts-bar-label
        *ngFor="let b of barsForDataLabels; let i = index; trackBy: trackDataLabelBy"
        [barX]="b.x"
        [barY]="b.y"
        [barWidth]="b.width"
        [barHeight]="b.height"
        [value]="b.total"
        [valueFormatting]="dataLabelFormatting"
        [orientation]="'vertical'"
        (dimensionsChanged)="dataLabelHeightChanged.emit({ size: $event, index: i })"
      />
    </svg:g>    
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('animationState', [
      transition(':leave', [
        style({
          opacity: 1
        }),
        animate(500, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class SeriesVerticalComponent implements OnChanges {
  @Input() dims;
  @Input() type = 'standard';
  @Input() series;
  @Input() xScale;
  @Input() yScale;
  @Input() colors;
  @Input() gradient: boolean;
  @Input() activeEntries: any[];
  @Input() seriesName: string;
  @Input() tooltipDisabled: boolean = false;
  @Input() tooltipTemplate: TemplateRef<any>;
  @Input() roundEdges: boolean;
  @Input() animations: boolean = true;
  @Input() showDataLabel: boolean = false;
  @Input() dataLabelFormatting: any;
  @Input() noBarWhenZero: boolean = true;

  @Input() barWidth: number = 0;
  @Input() noValueBarHeight: number = 16;
  @Input() noValueLabel: string = '';
  @Input() showSummaryTooltip: boolean = false;
  @Input() showSummaryTooltipOnAllArea: boolean = false;
  @Input() barPadding = 8;
  @Input() activateSerie: boolean = false;
  @Input() tooltipShowTimeout: number = 100;

  @Output() select = new EventEmitter();
  @Output() activate = new EventEmitter();
  @Output() deactivate = new EventEmitter();
  @Output() activateSibling = new EventEmitter();
  @Output() dataLabelHeightChanged = new EventEmitter();

  tooltipPlacement: string;
  tooltipType: string;

  bars: any;
  x: any;
  y: any;
  barsForDataLabels: Array<{ x: number; y: number; width: number; height: number; total: number; series: string }> = [];

  ngOnChanges(changes): void {
    this.update();
  }

  update(): void {
    this.updateTooltipSettings();
    let width;
    if (this.barWidth) {
      width = this.barWidth;
    } else {
      if (this.series.length) {
        width = this.xScale.bandwidth();
      }
      width = Math.round(width);
    }

    const barX = Math.round(this.xScale.bandwidth() / 2) - Math.round(width / 2);

    const yScaleMin = Math.max(this.yScale.domain()[0], 0);

    const d0 = {
      [D0Types.positive]: 0,
      [D0Types.negative]: 0
    };
    let d0Type = D0Types.positive;

    let total;
    if (this.type === 'normalized') {
      total = this.series.map(d => d.value).reduce((sum, d) => sum + d, 0);
    }

    let totalHeight = 0;
    const maxValue = this.yScale.domain()[1];    

    this.bars = this.series.map((d, index) => {
      let value = d.value;
      const label = this.getLabel(d);
      let formattedLabel = formatLabel(label);
      const roundEdges = this.roundEdges;
      
      d0Type = value > 0 ? D0Types.positive : D0Types.negative;

      const bar: any = {
        value,
        label,
        roundEdges,
        data: d,
        width,
        formattedLabel,
        height: 0,
        x: 0,
        y: 0
      };

      if (this.type === 'standard') {
        bar.height = Math.abs(this.yScale(value) - this.yScale(yScaleMin));
        bar.x = this.xScale(label);

        if (value < 0) {
          bar.y = this.yScale(0);
        } else {
          bar.y = this.yScale(value);
        }
      } else if (this.type === 'stacked') {
        const offset0 = d0[d0Type];

        let offset1 = offset0 + value;
        d0[d0Type] += value;

        if (value === 0) {
          formattedLabel = this.noValueLabel;
          offset1 = this.noValueBarHeight * maxValue / this.yScale(0);
        }

        if (maxValue === 0) {
          bar.height = this.noValueBarHeight;   
          bar.y = this.yScale(offset1) - this.noValueBarHeight;
        } else {
          totalHeight += this.yScale(offset0) - this.yScale(offset1);
          bar.height = totalHeight;   
          bar.y = this.yScale(offset1);
        }
             
        bar.x = barX;
        bar.offset0 = offset0;
        bar.offset1 = offset1;
      } else if (this.type === 'normalized') {
        let offset0 = d0[d0Type];
        let offset1 = offset0 + value;
        d0[d0Type] += value;

        if (total > 0) {
          offset0 = (offset0 * 100) / total;
          offset1 = (offset1 * 100) / total;
        } else {
          offset0 = 0;
          offset1 = 0;
        }

        bar.height = this.yScale(offset0) - this.yScale(offset1);
        bar.x = 0;
        bar.y = this.yScale(offset1);
        bar.offset0 = offset0;
        bar.offset1 = offset1;
        value = (offset1 - offset0).toFixed(2) + '%';
      }

      if (this.colors.scaleType === 'ordinal') {
        bar.color = this.colors.getColor(label, d);
      } else {
        if (this.type === 'standard') {
          bar.color = this.colors.getColor(value, d);
          bar.gradientStops = this.colors.getLinearGradientStops(value);
        } else {
          bar.color = this.colors.getColor(bar.offset1, d);
          bar.gradientStops = this.colors.getLinearGradientStops(bar.offset1, bar.offset0);
        }
      }

      let tooltipLabel = formattedLabel;
      if (value === 0) {
        bar.tooltipText = this.tooltipDisabled
          ? undefined
          : `
          <span class="tooltip-label">${tooltipLabel}</span>
        `;
      } else {
        bar.ariaLabel = formattedLabel + ' ' + value.toLocaleString();
        if (this.seriesName) {
          tooltipLabel = `${this.seriesName} • ${formattedLabel}`;
          bar.data.series = this.seriesName;
          bar.ariaLabel = this.seriesName + ' ' + bar.ariaLabel;
        }
  
        bar.tooltipText = this.tooltipDisabled
          ? undefined
          : `
          <span class="tooltip-label">${tooltipLabel}</span>
          <span class="tooltip-val">${value.toLocaleString()}</span>
        `;
      }
      
      return bar;
    });

    this.bars = this.bars.reverse();

    if (this.showSummaryTooltip === true) {
      const tooltipText = this.bars.map(bar => bar.tooltipText).join('');
      this.bars.forEach((bar, i) => {
        bar.tooltipText = undefined;
      });

      let summaryBarHeight = this.bars[0].height;
      let summaryBarY = this.bars[0].y;

      if (this.showSummaryTooltipOnAllArea === true) {
        summaryBarHeight = this.yScale(0);
        summaryBarY = 0;
      }

      this.bars.push({
        value: null,
        label: this.bars[0].label,
        data: this.bars[0].data,
        width: this.xScale.bandwidth() + this.barPadding,
        formattedLabel: this.bars[0].formattedLabel,
        height: summaryBarHeight,
        x: 0,
        y: summaryBarY,
        tooltipText,
        color: 'transparent'
      });
      
    }

    this.updateDataLabels();
  }

  updateDataLabels() {
    if (this.type === 'stacked') {
      this.barsForDataLabels = [];
      const section: any = {};
      section.series = this.seriesName;
      const totalPositive = this.series.map(d => d.value).reduce((sum, d) => (d > 0 ? sum + d : sum), 0);
      const totalNegative = this.series.map(d => d.value).reduce((sum, d) => (d < 0 ? sum + d : sum), 0);
      section.total = totalPositive + totalNegative;
      section.x = 0;
      section.y = 0;
      if (section.total > 0) {
        section.height = this.yScale(totalPositive);
      } else {
        section.height = this.yScale(totalNegative);
      }
      section.width = this.xScale.bandwidth();
      this.barsForDataLabels.push(section);
    } else {
      this.barsForDataLabels = this.series.map(d => {
        const section: any = {};
        section.series = this.seriesName ? this.seriesName : d.label;
        section.total = d.value;
        section.x = this.xScale(d.label);
        section.y = this.yScale(0);
        section.height = this.yScale(section.total) - this.yScale(0);
        section.width = this.xScale.bandwidth();
        return section;
      });
    }
  }

  updateTooltipSettings() {
    this.tooltipPlacement = this.tooltipDisabled ? undefined : 'top';
    this.tooltipType = this.tooltipDisabled ? undefined : 'tooltip';
  }

  isActive(entry): boolean {
    if (!this.activeEntries) return false;
    const item = this.activeEntries.find((d) => this.findCurrentActiveEntry(d, entry));
    return item !== undefined;
  }

  isOtherActive(entry): boolean {
    return this.activeEntries.filter((d) => !this.findCurrentActiveEntry(d, entry)).length > 0;
  }

  findCurrentActiveEntry(d, entry) {
      if (this.activateSerie) {
        return entry.series === d.series;  
      }
      return entry.name === d.name && entry.series === d.series;
  }

  onClick(data: DataItem): void {
    this.select.emit(data);
  }

  getLabel(dataItem): string {
    if (dataItem.label) {
      return dataItem.label;
    }
    return dataItem.name;
  }

  trackBy(index, bar): string {
    return bar.label;
  }

  trackDataLabelBy(index, barLabel) {
    return index + '#' + barLabel.series + '#' + barLabel.total;
  }

  serializedBarData(bar) {
    return JSON.stringify(bar.data);
  }
}
