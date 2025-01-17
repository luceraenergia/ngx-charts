var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, TemplateRef } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { formatLabel } from '../common/label.helper';
export var D0Types;
(function (D0Types) {
    D0Types["positive"] = "positive";
    D0Types["negative"] = "negative";
})(D0Types || (D0Types = {}));
var SeriesVerticalComponent = /** @class */ (function () {
    function SeriesVerticalComponent() {
        this.type = 'standard';
        this.tooltipDisabled = false;
        this.animations = true;
        this.showDataLabel = false;
        this.noBarWhenZero = true;
        this.barWidth = 0;
        this.noValueBarHeight = 16;
        this.noValueLabel = '';
        this.showSummaryTooltip = false;
        this.showSummaryTooltipOnAllArea = false;
        this.barPadding = 8;
        this.activateSerie = false;
        this.tooltipShowTimeout = 100;
        this.select = new EventEmitter();
        this.activate = new EventEmitter();
        this.deactivate = new EventEmitter();
        this.activateSibling = new EventEmitter();
        this.dataLabelHeightChanged = new EventEmitter();
        this.barsForDataLabels = [];
    }
    SeriesVerticalComponent.prototype.ngOnChanges = function (changes) {
        this.update();
    };
    SeriesVerticalComponent.prototype.update = function () {
        var _this = this;
        var _a;
        this.updateTooltipSettings();
        var width;
        if (this.barWidth) {
            width = this.barWidth;
        }
        else {
            if (this.series.length) {
                width = this.xScale.bandwidth();
            }
            width = Math.round(width);
        }
        var barX = Math.round(this.xScale.bandwidth() / 2) - Math.round(width / 2);
        var yScaleMin = Math.max(this.yScale.domain()[0], 0);
        var d0 = (_a = {},
            _a[D0Types.positive] = 0,
            _a[D0Types.negative] = 0,
            _a);
        var d0Type = D0Types.positive;
        var total;
        if (this.type === 'normalized') {
            total = this.series.map(function (d) { return d.value; }).reduce(function (sum, d) { return sum + d; }, 0);
        }
        var totalHeight = 0;
        var maxValue = this.yScale.domain()[1];
        this.bars = this.series.map(function (d, index) {
            var value = d.value;
            var label = _this.getLabel(d);
            var formattedLabel = formatLabel(label);
            var roundEdges = _this.roundEdges;
            d0Type = value > 0 ? D0Types.positive : D0Types.negative;
            var bar = {
                value: value,
                label: label,
                roundEdges: roundEdges,
                data: d,
                width: width,
                formattedLabel: formattedLabel,
                height: 0,
                x: 0,
                y: 0
            };
            if (_this.type === 'standard') {
                bar.height = Math.abs(_this.yScale(value) - _this.yScale(yScaleMin));
                bar.x = _this.xScale(label);
                if (value < 0) {
                    bar.y = _this.yScale(0);
                }
                else {
                    bar.y = _this.yScale(value);
                }
            }
            else if (_this.type === 'stacked') {
                var offset0 = d0[d0Type];
                var offset1 = offset0 + value;
                d0[d0Type] += value;
                if (value === 0) {
                    formattedLabel = _this.noValueLabel;
                    offset1 = _this.noValueBarHeight * maxValue / _this.yScale(0);
                }
                if (maxValue === 0) {
                    bar.height = _this.noValueBarHeight;
                    bar.y = _this.yScale(offset1) - _this.noValueBarHeight;
                }
                else {
                    totalHeight += _this.yScale(offset0) - _this.yScale(offset1);
                    bar.height = totalHeight;
                    bar.y = _this.yScale(offset1);
                }
                bar.x = barX;
                bar.offset0 = offset0;
                bar.offset1 = offset1;
            }
            else if (_this.type === 'normalized') {
                var offset0 = d0[d0Type];
                var offset1 = offset0 + value;
                d0[d0Type] += value;
                if (total > 0) {
                    offset0 = (offset0 * 100) / total;
                    offset1 = (offset1 * 100) / total;
                }
                else {
                    offset0 = 0;
                    offset1 = 0;
                }
                bar.height = _this.yScale(offset0) - _this.yScale(offset1);
                bar.x = 0;
                bar.y = _this.yScale(offset1);
                bar.offset0 = offset0;
                bar.offset1 = offset1;
                value = (offset1 - offset0).toFixed(2) + '%';
            }
            if (_this.colors.scaleType === 'ordinal') {
                bar.color = _this.colors.getColor(label, d);
            }
            else {
                if (_this.type === 'standard') {
                    bar.color = _this.colors.getColor(value, d);
                    bar.gradientStops = _this.colors.getLinearGradientStops(value);
                }
                else {
                    bar.color = _this.colors.getColor(bar.offset1, d);
                    bar.gradientStops = _this.colors.getLinearGradientStops(bar.offset1, bar.offset0);
                }
            }
            var tooltipLabel = formattedLabel;
            if (value === 0) {
                bar.tooltipText = _this.tooltipDisabled
                    ? undefined
                    : "\n          <span class=\"tooltip-label\">" + tooltipLabel + "</span>\n        ";
            }
            else {
                bar.ariaLabel = formattedLabel + ' ' + value.toLocaleString();
                if (_this.seriesName) {
                    tooltipLabel = _this.seriesName + " \u2022 " + formattedLabel;
                    bar.data.series = _this.seriesName;
                    bar.ariaLabel = _this.seriesName + ' ' + bar.ariaLabel;
                }
                bar.tooltipText = _this.tooltipDisabled
                    ? undefined
                    : "\n          <span class=\"tooltip-label\">" + tooltipLabel + "</span>\n          <span class=\"tooltip-val\">" + value.toLocaleString() + "</span>\n        ";
            }
            return bar;
        });
        this.bars = this.bars.reverse();
        if (this.showSummaryTooltip === true) {
            var tooltipText = this.bars.map(function (bar) { return bar.tooltipText; }).join('');
            this.bars.forEach(function (bar, i) {
                bar.tooltipText = undefined;
            });
            var summaryBarHeight = this.bars[0].height;
            var summaryBarY = this.bars[0].y;
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
                tooltipText: tooltipText,
                color: 'transparent'
            });
        }
        this.updateDataLabels();
    };
    SeriesVerticalComponent.prototype.updateDataLabels = function () {
        var _this = this;
        if (this.type === 'stacked') {
            this.barsForDataLabels = [];
            var section = {};
            section.series = this.seriesName;
            var totalPositive = this.series.map(function (d) { return d.value; }).reduce(function (sum, d) { return (d > 0 ? sum + d : sum); }, 0);
            var totalNegative = this.series.map(function (d) { return d.value; }).reduce(function (sum, d) { return (d < 0 ? sum + d : sum); }, 0);
            section.total = totalPositive + totalNegative;
            section.x = 0;
            section.y = 0;
            if (section.total > 0) {
                section.height = this.yScale(totalPositive);
            }
            else {
                section.height = this.yScale(totalNegative);
            }
            section.width = this.xScale.bandwidth();
            this.barsForDataLabels.push(section);
        }
        else {
            this.barsForDataLabels = this.series.map(function (d) {
                var section = {};
                section.series = _this.seriesName ? _this.seriesName : d.label;
                section.total = d.value;
                section.x = _this.xScale(d.label);
                section.y = _this.yScale(0);
                section.height = _this.yScale(section.total) - _this.yScale(0);
                section.width = _this.xScale.bandwidth();
                return section;
            });
        }
    };
    SeriesVerticalComponent.prototype.updateTooltipSettings = function () {
        this.tooltipPlacement = this.tooltipDisabled ? undefined : 'top';
        this.tooltipType = this.tooltipDisabled ? undefined : 'tooltip';
    };
    SeriesVerticalComponent.prototype.isActive = function (entry) {
        var _this = this;
        if (!this.activeEntries)
            return false;
        var item = this.activeEntries.find(function (d) { return _this.findCurrentActiveEntry(d, entry); });
        return item !== undefined;
    };
    SeriesVerticalComponent.prototype.isOtherActive = function (entry) {
        var _this = this;
        return this.activeEntries.filter(function (d) { return !_this.findCurrentActiveEntry(d, entry); }).length > 0;
    };
    SeriesVerticalComponent.prototype.findCurrentActiveEntry = function (d, entry) {
        if (this.activateSerie) {
            return entry.series === d.series;
        }
        return entry.name === d.name && entry.series === d.series;
    };
    SeriesVerticalComponent.prototype.onClick = function (data) {
        this.select.emit(data);
    };
    SeriesVerticalComponent.prototype.getLabel = function (dataItem) {
        if (dataItem.label) {
            return dataItem.label;
        }
        return dataItem.name;
    };
    SeriesVerticalComponent.prototype.trackBy = function (index, bar) {
        return bar.label;
    };
    SeriesVerticalComponent.prototype.trackDataLabelBy = function (index, barLabel) {
        return index + '#' + barLabel.series + '#' + barLabel.total;
    };
    SeriesVerticalComponent.prototype.serializedBarData = function (bar) {
        return JSON.stringify(bar.data);
    };
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SeriesVerticalComponent.prototype, "dims", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SeriesVerticalComponent.prototype, "type", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SeriesVerticalComponent.prototype, "series", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SeriesVerticalComponent.prototype, "xScale", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SeriesVerticalComponent.prototype, "yScale", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SeriesVerticalComponent.prototype, "colors", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], SeriesVerticalComponent.prototype, "gradient", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], SeriesVerticalComponent.prototype, "activeEntries", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], SeriesVerticalComponent.prototype, "seriesName", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], SeriesVerticalComponent.prototype, "tooltipDisabled", void 0);
    __decorate([
        Input(),
        __metadata("design:type", TemplateRef)
    ], SeriesVerticalComponent.prototype, "tooltipTemplate", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], SeriesVerticalComponent.prototype, "roundEdges", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], SeriesVerticalComponent.prototype, "animations", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], SeriesVerticalComponent.prototype, "showDataLabel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SeriesVerticalComponent.prototype, "dataLabelFormatting", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], SeriesVerticalComponent.prototype, "noBarWhenZero", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], SeriesVerticalComponent.prototype, "barWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], SeriesVerticalComponent.prototype, "noValueBarHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], SeriesVerticalComponent.prototype, "noValueLabel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], SeriesVerticalComponent.prototype, "showSummaryTooltip", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], SeriesVerticalComponent.prototype, "showSummaryTooltipOnAllArea", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SeriesVerticalComponent.prototype, "barPadding", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], SeriesVerticalComponent.prototype, "activateSerie", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], SeriesVerticalComponent.prototype, "tooltipShowTimeout", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], SeriesVerticalComponent.prototype, "select", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], SeriesVerticalComponent.prototype, "activate", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], SeriesVerticalComponent.prototype, "deactivate", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], SeriesVerticalComponent.prototype, "activateSibling", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], SeriesVerticalComponent.prototype, "dataLabelHeightChanged", void 0);
    SeriesVerticalComponent = __decorate([
        Component({
            selector: 'g[ngx-charts-series-vertical]',
            template: "\n    <svg:g\n      ngx-charts-bar\n      *ngFor=\"let bar of bars; trackBy: trackBy\"\n      [@animationState]=\"'active'\"\n      [@.disabled]=\"!animations\"\n      [width]=\"bar.width\"\n      [height]=\"bar.height\"\n      [x]=\"bar.x\"\n      [y]=\"bar.y\"\n      [fill]=\"bar.color\"\n      [stops]=\"bar.gradientStops\"\n      [data]=\"bar.data\"\n      [orientation]=\"'vertical'\"\n      [roundEdges]=\"bar.roundEdges\"\n      [gradient]=\"gradient\"\n      [ariaLabel]=\"bar.ariaLabel\"\n      [isActive]=\"isActive(bar.data)\"\n      [isOtherActive]=\"isOtherActive(bar.data)\"\n      (select)=\"onClick($event)\"\n      (activate)=\"activate.emit($event)\"\n      (deactivate)=\"deactivate.emit($event)\"\n      (activateSibling)=\"activateSibling.emit($event)\"\n      ngx-tooltip\n      [tooltipDisabled]=\"tooltipDisabled\"\n      [tooltipPlacement]=\"tooltipPlacement\"\n      [tooltipType]=\"tooltipType\"\n      [tooltipTitle]=\"tooltipTemplate ? undefined : bar.tooltipText\"\n      [tooltipTemplate]=\"tooltipTemplate\"\n      [tooltipContext]=\"bar.data\"\n      [tooltipShowTimeout]=\"tooltipShowTimeout\"\n      [noBarWhenZero]=\"noBarWhenZero\"\n      [animations]=\"animations\"\n      [attr.data-bardata]=\"serializedBarData(bar)\"\n    ></svg:g>\n    <svg:g *ngIf=\"showDataLabel\">\n      <svg:g\n        ngx-charts-bar-label\n        *ngFor=\"let b of barsForDataLabels; let i = index; trackBy: trackDataLabelBy\"\n        [barX]=\"b.x\"\n        [barY]=\"b.y\"\n        [barWidth]=\"b.width\"\n        [barHeight]=\"b.height\"\n        [value]=\"b.total\"\n        [valueFormatting]=\"dataLabelFormatting\"\n        [orientation]=\"'vertical'\"\n        (dimensionsChanged)=\"dataLabelHeightChanged.emit({ size: $event, index: i })\"\n      />\n    </svg:g>    \n  ",
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
    ], SeriesVerticalComponent);
    return SeriesVerticalComponent;
}());
export { SeriesVerticalComponent };
//# sourceMappingURL=series-vertical.component.js.map