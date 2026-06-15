import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexGrid,
  ApexTitleSubtitle,
  ApexFill,
  ApexLegend,
  ApexResponsive,
  ApexYAxis,
  ApexPlotOptions,
  ApexTooltip,
} from 'ng-apexcharts';
import { MonthlySales } from '../../core/models/monthly-sales.model';
import { TopProduct } from '../../core/models/top-product.model';

export type LineChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  grid: ApexGrid;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis | ApexYAxis[];
  tooltip: ApexTooltip;
};

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  xaxis: ApexXAxis;
  fill: ApexFill;
  legend: ApexLegend;
  responsive?: ApexResponsive[];
  title?: ApexTitleSubtitle;
};

@Component({
  selector: 'app-admin-reports-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      <div class="bg-white rounded-xl shadow p-4">
        <h4 class="text-lg font-semibold mb-3">Monthly Revenue</h4>
        <apx-chart
          *ngIf="lineChartOptions"
          [series]="lineChartOptions.series"
          [chart]="lineChartOptions.chart"
          [xaxis]="lineChartOptions.xaxis"
          [dataLabels]="lineChartOptions.dataLabels"
          [stroke]="lineChartOptions.stroke"
          [grid]="lineChartOptions.grid"
          [yaxis]="lineChartOptions!.yaxis"
          [tooltip]="lineChartOptions!.tooltip"
        ></apx-chart>
      </div>

      <div class="bg-white rounded-xl shadow p-4">
        <h4 class="text-lg font-semibold mb-3">Top Products</h4>
        <apx-chart
          *ngIf="barChartOptions"
          [series]="barChartOptions.series"
          [chart]="barChartOptions.chart"
          [plotOptions]="barChartOptions!.plotOptions"
          [dataLabels]="barChartOptions!.dataLabels"
          [xaxis]="barChartOptions!.xaxis"
          [fill]="barChartOptions!.fill"
          [legend]="barChartOptions!.legend"
        ></apx-chart>
      </div>
    </div>
  `,
})
export class AdminReportsChartComponent implements OnChanges {
  @Input() monthlySales: MonthlySales[] = [];
  @Input() topProducts: TopProduct[] = [];

  lineChartOptions?: LineChartOptions;
  barChartOptions?: BarChartOptions;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['monthlySales']) {
      this.buildLineChart();
    }
    if (changes['topProducts']) {
      this.buildBarChart();
    }
  }

  private buildLineChart(): void {
    const months = this.monthlySales.map((m) => m.month);
    const revenues = this.monthlySales.map((m) => m.totalRevenue);

    this.lineChartOptions = {
      series: [
        {
          name: 'Revenue',
          data: revenues,
        },
      ],
      chart: {
        height: 300,
        type: 'line',
        toolbar: { show: false },
      },
      xaxis: {
        categories: months,
        labels: { style: { colors: '#6b7280' } },
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      grid: { borderColor: '#e5e7eb' },
      title: { text: '', align: 'left' },
      yaxis: { labels: { formatter: (val: number) => `Rs. ${val.toLocaleString()}` } },
      tooltip: { y: { formatter: (val: number) => `Rs. ${val.toLocaleString()}` } },
    };
  }

  private buildBarChart(): void {
    const labels = this.topProducts.map((p) => p.productName);
    const quantities = this.topProducts.map((p) => p.quantitySold);

    this.barChartOptions = {
      series: [
        {
          name: 'Quantity',
          data: quantities,
        },
      ],
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: { horizontal: true, borderRadius: 6 },
      },
      dataLabels: { enabled: false },
      xaxis: { categories: labels, labels: { style: { colors: '#6b7280' } } },
      fill: { opacity: 0.9 },
      legend: { show: false },
      title: { text: '', align: 'left' },
    };
  }
}







