import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
    Self,
    SimpleChanges,
    ViewChild
} from "@angular/core";
import {TSChartSettings} from './model/ts-chart-settings';
import {UplotSyncService} from './uplot-sync-service';

declare const uPlot: any;

@Component({
  selector: 'step-timeseries-chart',
  templateUrl: './time-series-chart.component.html',
  styleUrls: ['./time-series-chart.component.scss'],
})
export class TimeSeriesChartComponent implements OnInit, AfterViewInit, OnChanges {

    private readonly HEADER_WITH_FOOTER_SIZE = 94;
    readonly WRAPPER_PADDING_PX = 12;
    readonly WRAPPER_PADDING = '12px';

    @ViewChild('chart') private chartElement: ElementRef;

    @Input('settings') settings: TSChartSettings;
    @Input('syncKey') syncKey: string;
    @Input('type') type: 'standard' | 'ranger' = 'standard';

    uplot: uPlot;

    constructor(@Self() private element: ElementRef) {
    }

    ngOnInit(): void {
        if (this.syncKey) {
            uPlot.sync(this.syncKey);
        }
    }

    ngAfterViewInit(): void {

        let getSize = () => {
            return {
                width: this.element.nativeElement.parentElement.offsetWidth - 24,
                height: this.element.nativeElement.parentElement.offsetHeight - this.HEADER_WITH_FOOTER_SIZE,
            }
        }

        const cursorOpts = {
                lock: true,
                focus: {
                    prox: 16,
                },
                y: false,
                sync: {}
            };
        if (this.syncKey) {
            cursorOpts.sync = {
                key: this.syncKey,
                    setSeries: true,
                    match: [UplotSyncService.syncFunction, UplotSyncService.syncFunction],
            }
        }

        const opts = {
            title: this.settings.title,
            ...getSize(),
            cursor: cursorOpts,
            scales: {
                x: {
                    time: true,
                },
                y: {
                },
            },
            axes: [
                {},
                ...this.settings.axes
            ],
            series: [
                {
                    label: 'Timestamp',
                },
                ...this.settings.series
            ],
        };

        if (this.type === 'ranger') {
            // @ts-ignore
            opts.hooks = {
                hooks: {
                    ready: [
                        (uRanger: any) => {
                            let height = uRanger.bbox.height / devicePixelRatio;
                            uRanger.setSelect({height}, false);
                        }
                    ]
                }
            };
            // @ts-ignore
            opts.legend = {show: false}; opts.scales = {x: {time: false}};

        }

        this.uplot = new uPlot(opts, [this.settings.xValues, ...this.settings.series.map(s => s.data)], this.chartElement.nativeElement);

        if (this.settings.autoResize) {
            window.addEventListener("resize", e => {
                this.uplot.setSize(getSize());
            });
        }

    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    update(): void {

    }

}
