var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, Output, EventEmitter, ViewEncapsulation, ChangeDetectionStrategy, ContentChild, TemplateRef, HostListener } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { scaleBand, scaleLinear } from 'd3-scale';
import { calculateViewDimensions } from '../common/view-dimensions.helper';
import { ColorHelper } from '../common/color.helper';
import { BaseChartComponent } from '../common/base-chart.component';
var BarVerticalStackedComponent = /** @class */ (function (_super) {
    __extends(BarVerticalStackedComponent, _super);
    function BarVerticalStackedComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.legend = false;
        _this.legendTitle = 'Legend';
        _this.legendPosition = 'right';
        _this.tooltipDisabled = false;
        _this.showGridLines = true;
        _this.activeEntries = [];
        _this.trimXAxisTicks = true;
        _this.trimYAxisTicks = true;
        _this.rotateXAxisTicks = true;
        _this.maxXAxisTickLength = 16;
        _this.maxYAxisTickLength = 16;
        _this.barPadding = 8;
        _this.roundDomains = false;
        _this.roundEdges = true;
        _this.showDataLabel = false;
        _this.noBarWhenZero = true;
        _this.activateSerie = true;
        _this.tooltipShowTimeout = 100;
        _this.barWidth = 0;
        _this.noValueBarHeight = 16;
        _this.noValueLabel = '';
        _this.yAxisOrient = 'left';
        _this.innerMargin = [10, 20, 10, 20];
        _this.showSummaryTooltip = false;
        _this.showSummaryTooltipOnAllArea = false;
        _this.activateOnTouchMove = false;
        _this.activate = new EventEmitter();
        _this.deactivate = new EventEmitter();
        _this.xAxisHeight = 0;
        _this.yAxisWidth = 0;
        _this.dataLabelMaxHeight = { negative: 0, positive: 0 };
        return _this;
    }
    BarVerticalStackedComponent.prototype.update = function () {
        _super.prototype.update.call(this);
        if (!this.showDataLabel) {
            this.dataLabelMaxHeight = { negative: 0, positive: 0 };
        }
        this.margin = [
            this.innerMargin[0] + this.dataLabelMaxHeight.positive,
            this.innerMargin[1],
            this.innerMargin[2] + this.dataLabelMaxHeight.negative,
            this.innerMargin[3]
        ];
        this.dims = calculateViewDimensions({
            width: this.width,
            height: this.height,
            margins: this.margin,
            showXAxis: this.xAxis,
            showYAxis: this.yAxis,
            xAxisHeight: this.xAxisHeight,
            yAxisWidth: this.yAxisWidth,
            showXLabel: this.showXAxisLabel,
            showYLabel: this.showYAxisLabel,
            showLegend: this.legend,
            legendType: this.schemeType,
            legendPosition: this.legendPosition
        });
        if (this.showDataLabel) {
            this.dims.height -= this.dataLabelMaxHeight.negative;
        }
        this.formatDates();
        this.groupDomain = this.getGroupDomain();
        this.innerDomain = this.getInnerDomain();
        this.valueDomain = this.getValueDomain();
        this.xScale = this.getXScale();
        this.yScale = this.getYScale();
        this.setColors();
        this.legendOptions = this.getLegendOptions();
        this.transform = "translate(" + this.dims.xOffset + " , " + (this.margin[0] + this.dataLabelMaxHeight.negative) + ")";
    };
    BarVerticalStackedComponent.prototype.getGroupDomain = function () {
        var domain = [];
        for (var _i = 0, _a = this.results; _i < _a.length; _i++) {
            var group = _a[_i];
            if (!domain.includes(group.label)) {
                domain.push(group.label);
            }
        }
        return domain;
    };
    BarVerticalStackedComponent.prototype.getInnerDomain = function () {
        var domain = [];
        for (var _i = 0, _a = this.results; _i < _a.length; _i++) {
            var group = _a[_i];
            for (var _b = 0, _c = group.series; _b < _c.length; _b++) {
                var d = _c[_b];
                if (!domain.includes(d.label)) {
                    domain.push(d.label);
                }
            }
        }
        return domain;
    };
    BarVerticalStackedComponent.prototype.getValueDomain = function () {
        var domain = [];
        var smallest = 0;
        var biggest = 0;
        for (var _i = 0, _a = this.results; _i < _a.length; _i++) {
            var group = _a[_i];
            var smallestSum = 0;
            var biggestSum = 0;
            for (var _b = 0, _c = group.series; _b < _c.length; _b++) {
                var d = _c[_b];
                if (d.value < 0) {
                    smallestSum += d.value;
                }
                else {
                    biggestSum += d.value;
                }
                smallest = d.value < smallest ? d.value : smallest;
                biggest = d.value > biggest ? d.value : biggest;
            }
            domain.push(smallestSum);
            domain.push(biggestSum);
        }
        domain.push(smallest);
        domain.push(biggest);
        var min = Math.min.apply(Math, [0].concat(domain));
        var max = this.yScaleMax ? Math.max.apply(Math, [this.yScaleMax].concat(domain)) : Math.max.apply(Math, domain);
        return [min, max];
    };
    BarVerticalStackedComponent.prototype.getXScale = function () {
        var spacing = this.groupDomain.length / (this.dims.width / this.barPadding + 1);
        return scaleBand()
            .rangeRound([0, this.dims.width])
            .paddingInner(spacing)
            .domain(this.groupDomain);
    };
    BarVerticalStackedComponent.prototype.getYScale = function () {
        var scale = scaleLinear()
            .range([this.dims.height, 0])
            .domain(this.valueDomain);
        return this.roundDomains ? scale.nice() : scale;
    };
    BarVerticalStackedComponent.prototype.onDataLabelMaxHeightChanged = function (event, groupIndex) {
        var _this = this;
        if (event.size.negative) {
            this.dataLabelMaxHeight.negative = Math.max(this.dataLabelMaxHeight.negative, event.size.height);
        }
        else {
            this.dataLabelMaxHeight.positive = Math.max(this.dataLabelMaxHeight.positive, event.size.height);
        }
        if (groupIndex === this.results.length - 1) {
            setTimeout(function () { return _this.update(); });
        }
    };
    BarVerticalStackedComponent.prototype.groupTransform = function (group) {
        return "translate(" + this.xScale(group.name) + ", 0)";
    };
    BarVerticalStackedComponent.prototype.onClick = function (data, group) {
        if (group) {
            data.series = group.name;
        }
        this.select.emit(data);
    };
    BarVerticalStackedComponent.prototype.trackBy = function (index, item) {
        return item.name;
    };
    BarVerticalStackedComponent.prototype.setColors = function () {
        var domain;
        if (this.schemeType === 'ordinal') {
            domain = this.innerDomain;
        }
        else {
            domain = this.valueDomain;
        }
        this.colors = new ColorHelper(this.scheme, this.schemeType, domain, this.customColors);
    };
    BarVerticalStackedComponent.prototype.getLegendOptions = function () {
        var opts = {
            scaleType: this.schemeType,
            colors: undefined,
            domain: [],
            title: undefined,
            position: this.legendPosition
        };
        if (opts.scaleType === 'ordinal') {
            opts.domain = this.innerDomain;
            opts.colors = this.colors;
            opts.title = this.legendTitle;
        }
        else {
            opts.domain = this.valueDomain;
            opts.colors = this.colors.scale;
        }
        return opts;
    };
    BarVerticalStackedComponent.prototype.updateYAxisWidth = function (_a) {
        var width = _a.width;
        this.yAxisWidth = width;
        this.update();
    };
    BarVerticalStackedComponent.prototype.updateXAxisHeight = function (_a) {
        var height = _a.height;
        this.xAxisHeight = height;
        this.update();
    };
    BarVerticalStackedComponent.prototype.onActivate = function (event, group, fromLegend) {
        if (fromLegend === void 0) { fromLegend = false; }
        var item = Object.assign({}, event);
        if (group) {
            item.series = group.name;
        }
        var items = this.results
            .map(function (g) { return g.series; })
            .flat()
            .filter(function (i) {
            if (fromLegend) {
                return i.label === item.name;
            }
            else {
                return i.name === item.name && i.series === item.series;
            }
        });
        this.activeEntries = items.slice();
        this.activate.emit({ value: item, entries: this.activeEntries });
    };
    BarVerticalStackedComponent.prototype.onDeactivate = function (event, group, fromLegend) {
        if (fromLegend === void 0) { fromLegend = false; }
        var item = Object.assign({}, event);
        if (group) {
            item.series = group.name;
        }
        this.activeEntries = this.activeEntries.filter(function (i) {
            if (fromLegend) {
                return i.label !== item.name;
            }
            else {
                return !(i.name === item.name && i.series === item.series);
            }
        });
        this.deactivate.emit({ value: item, entries: this.activeEntries });
    };
    BarVerticalStackedComponent.prototype.onTouchmove = function (e) {
        if (this.activateOnTouchMove === true) {
            var elementFromPoint = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            if (elementFromPoint && elementFromPoint.parentElement.dataset.bardata) {
                this.onActivate(JSON.parse(elementFromPoint.parentElement.dataset.bardata), null);
            }
        }
    };
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], BarVerticalStackedComponent.prototype, "legend", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], BarVerticalStackedComponent.prototype, "legendTitle", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], BarVerticalStackedComponent.prototype, "legendPosition", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], BarVerticalStackedComponent.prototype, "xAxis", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], BarVerticalStackedComponent.prototype, "yAxis", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], BarVerticalStackedComponent.prototype, "showXAxisLabel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], BarVerticalStackedComponent.prototype, "showYAxisLabel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], BarVerticalStackedComponent.prototype, "xAxisLabel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], BarVerticalStackedComponent.prototype, "yAxisLabel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], BarVerticalStackedComponent.prototype, "tooltipDisabled", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], BarVerticalStackedComponent.prototype, "gradient", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], BarVerticalStackedComponent.prototype, "showGridLines", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], BarVerticalStackedComponent.prototype, "activeEntries", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], BarVerticalStackedComponent.prototype, "schemeType", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], BarVerticalStackedComponent.prototype, "trimXAxisTicks", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], BarVerticalStackedComponent.prototype, "trimYAxisTicks", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], BarVerticalStackedComponent.prototype, "rotateXAxisTicks", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], BarVerticalStackedComponent.prototype, "maxXAxisTickLength", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], BarVerticalStackedComponent.prototype, "maxYAxisTickLength", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], BarVerticalStackedComponent.prototype, "xAxisTickFormatting", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], BarVerticalStackedComponent.prototype, "yAxisTickFormatting", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], BarVerticalStackedComponent.prototype, "xAxisTicks", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], BarVerticalStackedComponent.prototype, "yAxisTicks", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], BarVerticalStackedComponent.prototype, "barPadding", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], BarVerticalStackedComponent.prototype, "roundDomains", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], BarVerticalStackedComponent.prototype, "roundEdges", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], BarVerticalStackedComponent.prototype, "yScaleMax", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], BarVerticalStackedComponent.prototype, "showDataLabel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], BarVerticalStackedComponent.prototype, "dataLabelFormatting", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], BarVerticalStackedComponent.prototype, "noBarWhenZero", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], BarVerticalStackedComponent.prototype, "activateSerie", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], BarVerticalStackedComponent.prototype, "tooltipShowTimeout", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], BarVerticalStackedComponent.prototype, "barWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], BarVerticalStackedComponent.prototype, "noValueBarHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], BarVerticalStackedComponent.prototype, "noValueLabel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], BarVerticalStackedComponent.prototype, "yAxisOrient", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], BarVerticalStackedComponent.prototype, "innerMargin", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], BarVerticalStackedComponent.prototype, "showSummaryTooltip", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], BarVerticalStackedComponent.prototype, "showSummaryTooltipOnAllArea", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], BarVerticalStackedComponent.prototype, "activateOnTouchMove", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], BarVerticalStackedComponent.prototype, "activate", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], BarVerticalStackedComponent.prototype, "deactivate", void 0);
    __decorate([
        ContentChild('tooltipTemplate', { static: false }),
        __metadata("design:type", TemplateRef)
    ], BarVerticalStackedComponent.prototype, "tooltipTemplate", void 0);
    __decorate([
        HostListener('touchmove', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], BarVerticalStackedComponent.prototype, "onTouchmove", null);
    BarVerticalStackedComponent = __decorate([
        Component({
            selector: 'ngx-charts-bar-vertical-stacked',
            template: "\n    <ngx-charts-chart\n      [view]=\"[width, height]\"\n      [showLegend]=\"legend\"\n      [legendOptions]=\"legendOptions\"\n      [activeEntries]=\"activeEntries\"\n      [animations]=\"animations\"\n      (legendLabelActivate)=\"onActivate($event, undefined, true)\"\n      (legendLabelDeactivate)=\"onDeactivate($event, undefined, true)\"\n      (legendLabelClick)=\"onClick($event)\"\n    >\n      <svg:g [attr.transform]=\"transform\" class=\"bar-chart chart\">\n        <svg:g\n          ngx-charts-x-axis\n          *ngIf=\"xAxis\"\n          [xScale]=\"xScale\"\n          [dims]=\"dims\"\n          [showLabel]=\"showXAxisLabel\"\n          [labelText]=\"xAxisLabel\"\n          [trimTicks]=\"trimXAxisTicks\"\n          [rotateTicks]=\"rotateXAxisTicks\"\n          [maxTickLength]=\"maxXAxisTickLength\"\n          [tickFormatting]=\"xAxisTickFormatting\"\n          [ticks]=\"xAxisTicks\"\n          [xAxisOffset]=\"dataLabelMaxHeight.negative\"\n          (dimensionsChanged)=\"updateXAxisHeight($event)\"\n        ></svg:g>\n        <svg:g\n          ngx-charts-y-axis\n          *ngIf=\"yAxis\"\n          [yScale]=\"yScale\"\n          [dims]=\"dims\"\n          [showGridLines]=\"showGridLines\"\n          [showLabel]=\"showYAxisLabel\"\n          [labelText]=\"yAxisLabel\"\n          [trimTicks]=\"trimYAxisTicks\"\n          [maxTickLength]=\"maxYAxisTickLength\"\n          [tickFormatting]=\"yAxisTickFormatting\"\n          [ticks]=\"yAxisTicks\"\n          [yOrient]=\"yAxisOrient\"\n          (dimensionsChanged)=\"updateYAxisWidth($event)\"\n        ></svg:g>\n        <svg:g\n          *ngFor=\"let group of results; let index = index; trackBy: trackBy\"\n          [@animationState]=\"'active'\"\n          [attr.transform]=\"groupTransform(group)\"\n        >\n          <svg:g\n            ngx-charts-series-vertical\n            type=\"stacked\"\n            [xScale]=\"xScale\"\n            [yScale]=\"yScale\"\n            [activeEntries]=\"activeEntries\"\n            [colors]=\"colors\"\n            [series]=\"group.series\"\n            [dims]=\"dims\"\n            [gradient]=\"gradient\"\n            [tooltipDisabled]=\"tooltipDisabled\"\n            [tooltipTemplate]=\"tooltipTemplate\"\n            [tooltipShowTimeout]=\"tooltipShowTimeout\"\n            [showSummaryTooltip]=\"showSummaryTooltip\"\n            [showSummaryTooltipOnAllArea]=\"showSummaryTooltipOnAllArea\"\n            [showDataLabel]=\"showDataLabel\"\n            [dataLabelFormatting]=\"dataLabelFormatting\"\n            [seriesName]=\"group.name\"\n            [roundEdges]=\"roundEdges\"\n            [animations]=\"animations\"\n            [noBarWhenZero]=\"noBarWhenZero\"\n            [barWidth]=\"barWidth\"\n            [noValueBarHeight]=\"noValueBarHeight\"\n            [noValueLabel]=\"noValueLabel\"\n            [barPadding]=\"barPadding\"\n            [activateSerie]=\"activateSerie\"\n            (select)=\"onClick($event, group)\"\n            (activate)=\"onActivate($event, group)\"\n            (deactivate)=\"onDeactivate($event, group)\"\n            (dataLabelHeightChanged)=\"onDataLabelMaxHeightChanged($event, index)\"\n            (activateSibling)=\"onActivateSibling($event, group)\"\n          />\n        </svg:g>\n      </svg:g>\n    </ngx-charts-chart>\n  ",
            styleUrls: ['../common/base-chart.component.css'],
            encapsulation: ViewEncapsulation.None,
            changeDetection: ChangeDetectionStrategy.OnPush,
            animations: [
                trigger('animationState', [
                    transition(':leave', [
                        style({
                            opacity: 1,
                            transform: '*'
                        }),
                        animate(500, style({ opacity: 0, transform: 'scale(0)' }))
                    ])
                ])
            ]
        })
    ], BarVerticalStackedComponent);
    return BarVerticalStackedComponent;
}(BaseChartComponent));
export { BarVerticalStackedComponent };
//# sourceMappingURL=bar-vertical-stacked.component.js.map